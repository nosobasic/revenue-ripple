from functools import wraps
from flask import request, jsonify


def require_user(handler):
    """Pass x-user-id from the request into route handlers as user_id."""
    @wraps(handler)
    def wrapper(*args, **kwargs):
        user_id = request.headers.get("x-user-id")
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        return handler(user_id, *args, **kwargs)
    return wrapper
