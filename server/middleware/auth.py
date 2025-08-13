import os
import jwt
from functools import wraps
from flask import request, g, abort


def _extract_bearer_token() -> str:
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return ''
    return auth_header.split(' ', 1)[1].strip()


def require_auth(handler):
    """
    Decorator that enforces Authorization: Bearer <token> and verifies it using SUPABASE_JWT_SECRET (HS256).
    Sets g.user_id and g.email when valid.
    """
    @wraps(handler)
    def wrapper(*args, **kwargs):
        token = _extract_bearer_token()
        if not token:
            abort(401)
        jwt_secret = os.getenv('SUPABASE_JWT_SECRET')
        if not jwt_secret:
            # Missing configuration – treat as server error
            abort(500)
        try:
            payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
            # Supabase JWT includes `sub` as user id
            g.user_id = payload.get('sub') or payload.get('user_id')
            g.email = payload.get('email')
            if not g.user_id:
                abort(401)
        except jwt.ExpiredSignatureError:
            abort(401)
        except jwt.InvalidTokenError:
            abort(401)
        return handler(*args, **kwargs)
    return wrapper