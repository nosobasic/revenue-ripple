from flask import Blueprint, request, jsonify, abort
import openai
import os
import traceback

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

@ai_assistant_bp.route('/api/ai-assistant', methods=['POST'])
def ai_assistant():
    if not client:
        return jsonify({"error": "AI assistant is not available - OpenAI API key not configured"}), 503
    
    user_role = request.headers.get("x-user-role")
    print("User role:", user_role)
    if not is_authorized(user_role):
        print("Unauthorized access attempt")
        abort(403, "Not authorized")

    data = request.get_json()
    print("Request data:", data)
    user_message = data.get("message", "")
    print("User message:", user_message)
    prompt = (
        "You are Revenue Ripple's AI Assistant, a seasoned internet marketing pro and support agent. "
        "Greet the user warmly, use the brand voice, and provide actionable, friendly, and expert advice. "
        "If the question is about the platform, answer specifically. If it's a general marketing question, give best practices.\n\n"
        f"User: {user_message}\nAI:"
    )
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.7
        )
        return jsonify({"reply": response.choices[0].message.content})
    except Exception as e:
        print("AI Assistant error:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500 