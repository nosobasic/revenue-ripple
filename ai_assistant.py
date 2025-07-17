from flask import Blueprint, request, jsonify, abort
import openai
import os
import traceback
import time
from functools import lru_cache

ai_assistant_bp = Blueprint('ai_assistant', __name__)

# Make OpenAI client optional
try:
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        client = openai.OpenAI(api_key=openai_api_key)
    else:
        client = None
        print("⚠️ OpenAI API key not found - AI assistant will be disabled")
except Exception as e:
    client = None
    print(f"⚠️ Failed to initialize OpenAI client: {e}")

def is_authorized(user_role):
    return user_role in ["member", "affiliate", "reseller", "admin"]

@lru_cache(maxsize=50)
def get_context_prompt(page_path, user_role):
    """Generate context-specific prompts based on page and user role"""
    base_prompt = (
        "You are Ripple, Revenue Ripple's expert AI Marketing Assistant. You're friendly, "
        "knowledgeable, and always provide actionable advice. Keep responses concise but helpful, "
        "under 200 words unless the question requires detail. Use a conversational, encouraging tone."
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
        
        # Add context-specific prompt
        optimized_prompt = get_context_prompt(page, user_role) + "\n\n"
        
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
            model="gpt-4o-mini",  # Fastest model for good quality
            messages=[{"role": "user", "content": optimized_prompt}],
            max_tokens=300,  # Reduced for faster responses
            temperature=0.7,
            presence_penalty=0.1,  # Slight penalty to avoid repetition
            frequency_penalty=0.1,  # Slight penalty for more varied responses
            top_p=0.9,  # Focus on more likely tokens for consistency
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        # Log performance metrics
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
            "Course content explanations"
        ],
        "maxTokens": 300,
        "averageResponseTime": "1-3 seconds"
    }) 