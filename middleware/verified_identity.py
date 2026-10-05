"""Verify every caller with Supabase Auth; never trust a client-supplied ID/role."""
from functools import wraps
from flask import abort, current_app, g, request


def verified_identity():
    if getattr(g, '_verified_identity', None) is not None:
        return g._verified_identity
    parts = request.headers.get('Authorization', '').split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        abort(401, description='Sign in required')
    client = getattr(current_app, 'supabase', None)
    if client is None:
        from middleware.supabase_admin import get_supabase_admin
        client = get_supabase_admin()
    if client is None:
        abort(503, description='Authentication unavailable')
    try:
        # Remote verification handles Supabase key rotation and token expiry.
        user = client.auth.get_user(parts[1]).user
    except Exception:
        abort(401, description='Invalid or expired session')
    if not user or not getattr(user, 'id', None):
        abort(401, description='Invalid session')
    if request.headers.get('x-user-id') not in (None, '', str(user.id)):
        abort(403, description='Identity mismatch')
    g.user_id = str(user.id)
    g.email = getattr(user, 'email', None)
    g._verified_identity = user
    return user


def verified_profile_role():
    user = verified_identity()
    if hasattr(g, '_verified_profile_role'):
        return g._verified_profile_role
    client = getattr(current_app, 'supabase', None)
    if client is None:
        from middleware.supabase_admin import get_supabase_admin
        client = get_supabase_admin()
    try:
        rows = client.table('users').select('role').eq('id', str(user.id)).limit(1).execute().data
    except Exception:
        abort(503, description='Authorization unavailable')
    g._verified_profile_role = rows[0].get('role') if rows else None
    return g._verified_profile_role


def require_auth(handler):
    @wraps(handler)
    def wrapper(*args, **kwargs):
        verified_identity()
        return handler(*args, **kwargs)
    return wrapper


def require_user(handler):
    @wraps(handler)
    def wrapper(*args, **kwargs):
        user = verified_identity()
        return handler(str(user.id), *args, **kwargs)
    return wrapper


def require_admin():
    if verified_profile_role() != 'admin':
        abort(403, description='Administrator access required')


def install_access_guard(app):
    """Gate audited service-role routes; preserve public checkout/webhook paths."""
    @app.before_request
    def protect_service_routes():
        if request.method == 'OPTIONS':
            return None
        path = request.path
        admin = (path.startswith(('/admin/', '/devops/')) or path in (
            '/paypal/payout', '/your-existing-api/dashboard', '/stripe-test',
            '/api/engagement/recalculate', '/api/engagement/stats',
            '/api/engagement/at-risk-users'))
        if admin:
            require_admin()
            return None
        # These inactive endpoints accept profile/competitor IDs without proving
        # ownership. Keep closed until object-level authorization is implemented.
        if path.startswith('/api/ai-visibility/'):
            verified_identity()
            abort(503, description='AI visibility temporarily unavailable')
        protected = path.startswith(('/api/community/', '/api/engagement/',
                                     '/api/ai-assistant', '/api/vault/'))
        protected = protected or (path == '/api/success-stories' and request.method != 'GET')
        if not protected:
            return None
        user = verified_identity()
        payload = request.get_json(silent=True)
        candidates = [request.args.get('user_id')]
        if isinstance(payload, dict):
            candidates.append(payload.get('user_id'))
        if any(value not in (None, '', str(user.id)) for value in candidates):
            abort(403, description='Identity mismatch')
        return None
