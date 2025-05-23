from flask import Blueprint, request, jsonify, abort
import openai
import os

ai_assistant_bp = Blueprint('ai_assistant', __name__)

openai.api_key = os.getenv("OPENAI_API_KEY")

def is_authorized(user_role):
    return user_role in ["member", "affiliate", "reseller"]

@ai_assistant_bp.route('/api/ai-assistant', methods=['POST'])
def ai_assistant():
    user_role = request.headers.get("x-user-role")
    if not is_authorized(user_role):
        abort(403, "Not authorized")

    data = request.get_json()
    user_message = data.get("message", "")
    prompt = (
        "You are Revenue Ripple's AI Assistant, a seasoned internet marketing pro and support agent. "
        "Greet the user warmly, use the brand voice, and provide actionable, friendly, and expert advice. "
        "If the question is about the platform, answer specifically. If it's a general marketing question, give best practices.\n\n"
        f"User: {user_message}\nAI:"
    )
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.7
        )
        return jsonify({"reply": response.choices[0].message["content"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500 