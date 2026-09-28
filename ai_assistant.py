from flask import Blueprint, request, jsonify, abort
import openai
import os
import traceback
import time
from functools import lru_cache

ai_assistant_bp = Blueprint('ai_assistant', __name__)

# Make OpenAI client optional - uses Replit AI Integrations if available
try:
    # Try Replit AI Integration first (preferred), then fall back to direct API key
    openai_base_url = os.getenv("AI_INTEGRATIONS_OPENAI_BASE_URL")
    openai_api_key = os.getenv("AI_INTEGRATIONS_OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        if openai_base_url:
            client = openai.OpenAI(base_url=openai_base_url, api_key=openai_api_key)
            print("✅ AI assistant initialized via Replit AI Integration")
        else:
            client = openai.OpenAI(api_key=openai_api_key)
            print("✅ AI assistant initialized via direct API key")
    else:
        client = None
        # Silent - no warning needed since AI Visibility uses separate integration
except Exception as e:
    client = None
    print(f"⚠️ Failed to initialize AI assistant: {e}")

def is_authorized(user_role):
    return user_role in ["member", "affiliate", "reseller", "admin"]

@lru_cache(maxsize=50)
def get_context_prompt(page_path, user_role):
    """Generate context-specific prompts based on page and user role"""
    base_prompt = (
        "You are Ripple, Revenue Ripple’s AI Marketing Assistant. You give practical marketing help with a friendly, confident tone. "
        "Write for busy founders and marketers. Get to the point fast. "
        "Keep replies under 200 words unless the user asks for depth. "
        "No markdown. No numbered lists. Use short paragraphs. "
        "Use dash bullets for lists. One idea per line. "
        "Avoid filler openers. Avoid hype. Avoid emojis. "
        "Give clear next steps, examples, or simple templates when useful. "
        "If the user shares details, tailor advice to those details. "
        "If info is missing, make one best assumption and proceed. "
    )
    
    # Page-specific context
    page_context = ""
    if "/courses/" in page_path:
        page_context = " The user is currently viewing course content. Help with course-related questions, explain concepts, and provide implementation tips."
    elif "/training/" in page_path:
        page_context = " The user is in the training section. Provide practical guidance and clarify any marketing strategies or techniques."
    elif "/affiliate" in page_path:
        page_context = " The user is managing their affiliate activities. Help with promotion strategies, commission questions, and growth tips."
    elif "/dashboard" in page_path:
        page_context = " The user is on their dashboard. Help them navigate features and understand their progress."
    
    # Role-specific context
    role_context = ""
    if user_role == "affiliate":
        role_context = " Focus on affiliate marketing strategies and revenue optimization."
    elif user_role == "reseller":
        role_context = " Provide advanced business growth and scaling strategies."
    elif user_role == "admin":
        role_context = " You can also help with platform management and administrative questions."
    
    return base_prompt + page_context + role_context

def optimize_message_for_api(message, context=None, previous_messages=None):
    """Optimize the message for better API performance and context"""
    # Extract key information and reduce token usage
    optimized_prompt = ""
    
    if context:
        page = context.get('page', '')
        user_role = context.get('userRole', 'member')
        briefing = context.get('briefing')
        
        # Add context-specific prompt
        optimized_prompt = get_context_prompt(page, user_role) + "\n\n"
        
        # Add briefing context if available (for deep dive conversations)
        if briefing:
            briefing_context = f"IMPORTANT CONTEXT: The user is asking questions about a premium briefing they're exploring. "
            briefing_context += f"Briefing Title: {briefing.get('title', 'Unknown')}\n"
            
            if briefing.get('short_description'):
                briefing_context += f"Briefing Summary: {briefing.get('short_description')[:400]}\n"
            elif briefing.get('full_body'):
                briefing_context += f"Briefing Content: {briefing.get('full_body')[:400]}\n"
            
            if briefing.get('tags'):
                briefing_context += f"Related Topics: {', '.join(briefing.get('tags', []))}\n"
            
            briefing_context += "\nWhen answering, maintain awareness of this briefing context. Reference specific details from the briefing when relevant. "
            briefing_context += "If the user asks follow-up questions, they're likely referring to this briefing topic.\n\n"
            
            optimized_prompt += briefing_context
        
        # Add conversation context if available
        if previous_messages and len(previous_messages) > 0:
            recent_context = "\nRecent conversation:\n"
            for msg in previous_messages[-2:]:  # Only last 2 messages for context
                if msg.get('from') == 'user':
                    recent_context += f"User: {msg.get('text', '')}\n"
                elif msg.get('from') == 'ai':
                    recent_context += f"Assistant: {msg.get('text', '')}\n"
            optimized_prompt += recent_context + "\n"
    
    # Clean the message if it contains page context prefix
    if message.startswith("Page context:"):
        parts = message.split("User message:", 1)
        if len(parts) > 1:
            message = parts[1].strip()
    
    optimized_prompt += f"User: {message}\nAssistant:"
    return optimized_prompt

@ai_assistant_bp.route('/api/ai-assistant', methods=['POST'])
def ai_assistant():
    start_time = time.time()
    
    if not client:
        return jsonify({"error": "AI assistant is not available - OpenAI API key not configured"}), 503
    
    user_role = request.headers.get("x-user-role")
    user_id = request.headers.get("x-user-id")
    
    if not is_authorized(user_role):
        abort(403, "Not authorized")

    try:
        data = request.get_json()
        user_message = data.get("message", "")
        context = data.get("context", {})
        previous_messages = data.get("previousMessages", []) if data.get("context") else []
        
        if not user_message.strip():
            return jsonify({"error": "Message cannot be empty"}), 400
        
        # Optimize the prompt for better performance and context
        optimized_prompt = optimize_message_for_api(user_message, context, previous_messages)
        
        # Use optimized parameters for faster responses
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": optimized_prompt}],
            max_tokens=300,
            temperature=0.7,
            presence_penalty=0.1,
            frequency_penalty=0.1,
            top_p=0.9,
        )
        
        ai_response = (response.choices[0].message.content or "").strip()
        
        # Log interaction to database for learning and improvement
        try:
            if user_id:
                from middleware.supabase_admin import get_supabase_admin
                supabase = get_supabase_admin()
                supabase.table('ai_assistant_interactions').insert({
                    'user_id': user_id,
                    'interaction_type': 'question',
                    'context_page': context.get('page'),
                    'context_data': context,
                    'user_message': user_message,
                    'ai_response': ai_response
                }).execute()
        except Exception as log_error:
            print(f"Failed to log interaction: {log_error}")
        
        end_time = time.time()
        response_time = end_time - start_time
        print(f"AI Assistant response time: {response_time:.2f}s")
        
        return jsonify({
            "reply": ai_response,
            "responseTime": response_time,
            "timestamp": time.time()
        })
        
    except openai.RateLimitError:
        return jsonify({
            "error": "I'm experiencing high demand right now. Please wait a moment and try again.",
            "retryAfter": 30
        }), 429
        
    except openai.APIError as e:
        print(f"OpenAI API error: {e}")
        return jsonify({
            "error": "I'm having trouble connecting to my knowledge base. Please try again.",
            "technical_error": str(e) if os.getenv("DEBUG") == "true" else None
        }), 502
        
    except Exception as e:
        print("AI Assistant error:", e)
        print(traceback.format_exc())
        return jsonify({
            "error": "I encountered an unexpected issue. Please try again or contact support if this persists.",
            "technical_error": str(e) if os.getenv("DEBUG") == "true" else None
        }), 500

# Health check endpoint for the AI assistant
@ai_assistant_bp.route('/api/ai-assistant/health', methods=['GET'])
def health_check():
    """Check if the AI assistant is operational"""
    if not client:
        return jsonify({
            "status": "unavailable",
            "message": "OpenAI API key not configured"
        }), 503
    
    try:
        # Quick test to verify API connectivity
        test_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=5,
            temperature=0
        )
        
        return jsonify({
            "status": "healthy",
            "model": "gpt-4o-mini",
            "message": "AI assistant is operational"
        })
        
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "message": f"AI service connectivity issue: {str(e)}"
        }), 503

# Get AI assistant capabilities
@ai_assistant_bp.route('/api/ai-assistant/capabilities', methods=['GET'])
def get_capabilities():
    """Return the current capabilities of the AI assistant"""
    if not client:
        return jsonify({
            "available": False,
            "reason": "OpenAI API key not configured"
        })
    
    return jsonify({
        "available": True,
        "model": "gpt-4o-mini",
        "features": [
            "Context-aware responses",
            "Page-specific assistance",
            "Marketing strategy guidance",
            "Platform navigation help",
            "Affiliate program support",
            "Course content explanations",
            "Goal setting and tracking",
            "Proactive learning suggestions",
            "Interactive quizzes and homework",
            "Feature tours and onboarding"
        ],
        "maxTokens": 300,
        "averageResponseTime": "1-3 seconds"
    })

@ai_assistant_bp.route('/api/ai-assistant/suggestions', methods=['GET'])
def get_proactive_suggestions():
    """Get proactive AI suggestions based on user context"""
    if not client:
        return jsonify({"error": "AI assistant is not available"}), 503
    
    user_role = request.headers.get("x-user-role")
    user_id = request.headers.get("x-user-id")
    
    if not is_authorized(user_role) or not user_id:
        abort(403, "Not authorized")
    
    try:
        from middleware.supabase_admin import get_supabase_admin
        supabase = get_supabase_admin()
        
        goals_response = supabase.table('user_goals')\
            .select('*')\
            .eq('user_id', user_id)\
            .eq('status', 'active')\
            .order('priority', desc=False)\
            .limit(3)\
            .execute()
        
        progress_response = supabase.table('user_progress')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('last_updated', desc=True)\
            .limit(5)\
            .execute()
        
        quiz_response = supabase.table('user_quiz_responses')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .limit(3)\
            .execute()
        
        suggestions = []
        
        # Goal-based suggestions
        active_goals = goals_response.data or []
        if active_goals:
            high_priority_goals = [g for g in active_goals if g['priority'] == 1]
            if high_priority_goals:
                goal = high_priority_goals[0]
                suggestions.append({
                    'type': 'goal_reminder',
                    'priority': 'high',
                    'title': f"Work on: {goal['title']}",
                    'message': f"You have a high-priority goal waiting. Let's make progress!",
                    'action': {'type': 'navigate', 'path': '/dashboard?tab=goals'}
                })
        
        # Course progress suggestions
        in_progress_courses = [p for p in (progress_response.data or []) 
                              if p['status'] == 'in_progress' and p['percent_done'] < 100]
        if in_progress_courses:
            course = in_progress_courses[0]
            suggestions.append({
                'type': 'continue_learning',
                'priority': 'medium',
                'title': 'Continue Your Learning',
                'message': f"You're {course['percent_done']}% through a course. Keep the momentum going!",
                'action': {'type': 'navigate', 'path': f"/courses/{course['course_id']}"}
            })
        
        # Quiz reminder
        recent_quizzes = quiz_response.data or []
        failed_quizzes = [q for q in recent_quizzes if not q['passed']]
        if failed_quizzes:
            quiz = failed_quizzes[0]
            suggestions.append({
                'type': 'retry_quiz',
                'priority': 'medium',
                'title': 'Ready to Try Again?',
                'message': 'Practice makes perfect! Retake that quiz and master the material.',
                'action': {'type': 'navigate', 'path': f"/courses/{quiz['course_id']}/module-{quiz['module_id']}?tab=quiz"}
            })
        
        # New content suggestion
        if not in_progress_courses:
            suggestions.append({
                'type': 'start_learning',
                'priority': 'low',
                'title': 'Start a New Course',
                'message': 'Explore our course library and begin learning something new today!',
                'action': {'type': 'navigate', 'path': '/courses'}
            })
        
        return jsonify({
            'suggestions': suggestions[:3],
            'timestamp': time.time()
        })
    
    except Exception as e:
        print(f"Error generating suggestions: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to generate suggestions'}), 500

@ai_assistant_bp.route('/api/ai-assistant/feedback', methods=['POST'])
def record_feedback():
    """Record user feedback on AI interactions"""
    user_id = request.headers.get("x-user-id")
    
    if not user_id:
        abort(403, "Not authorized")
    
    try:
        data = request.get_json()
        interaction_id = data.get('interaction_id')
        reaction = data.get('reaction')  # 'helpful', 'not_helpful', 'dismissed', 'acted_upon'
        
        if not interaction_id or not reaction:
            return jsonify({'error': 'interaction_id and reaction are required'}), 400
        
        from middleware.supabase_admin import get_supabase_admin
        supabase = get_supabase_admin()
        
        supabase.table('ai_assistant_interactions')\
            .update({'user_reaction': reaction})\
            .eq('id', interaction_id)\
            .eq('user_id', user_id)\
            .execute()
        
        return jsonify({'message': 'Feedback recorded'})
    
    except Exception as e:
        print(f"Error recording feedback: {e}")
        return jsonify({'error': 'Failed to record feedback'}), 500 