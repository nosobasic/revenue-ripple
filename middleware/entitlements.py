import os
from functools import wraps
from datetime import datetime
from flask import g, abort
from supabase import create_client

PLAN_TO_TIER = {
    "member": "core",
    "reseller": "growth",
    "pro_reseller": "partner",
    "core": "core",
    "growth": "growth",
    "partner": "partner",
}

CORE_SUGGESTIONS_LIMIT = int(os.getenv('CORE_SUGGESTIONS_LIMIT', '25'))

_supabase = None

def _get_supabase():
    global _supabase
    if _supabase is not None:
        return _supabase
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if not supabase_url or not supabase_key:
        raise RuntimeError('Supabase configuration missing')
    _supabase = create_client(supabase_url, supabase_key)
    return _supabase


def resolve_tier(user_id: str) -> str:
    sb = _get_supabase()
    res = sb.table('users').select('plan').eq('id', user_id).single().execute()
    plan = (res.data or {}).get('plan') if hasattr(res, 'data') else None
    plan_norm = plan.lower() if isinstance(plan, str) else 'member'
    return PLAN_TO_TIER.get(plan_norm, 'core')


def require_tier(allowed_tiers):
    def decorator(handler):
        @wraps(handler)
        def wrapper(*args, **kwargs):
            user_tier = getattr(g, 'tier', None)
            if not user_tier:
                g.tier = resolve_tier(g.user_id)
                user_tier = g.tier
            if user_tier not in allowed_tiers:
                abort(403)
            return handler(*args, **kwargs)
        return wrapper
    return decorator


def increment_suggestions_usage(user_id: str) -> dict:
    sb = _get_supabase()
    month = datetime.utcnow().strftime('%Y-%m-01')
    sb.table('insights_usage').upsert({ 'user_id': user_id, 'month': month }, on_conflict='user_id,month').execute()
    res = sb.rpc('increment_suggestions_queries', { 'p_user_id': user_id, 'p_month': month }).execute()
    if not getattr(res, 'data', None):
        row = sb.table('insights_usage').select('suggestions_queries').eq('user_id', user_id).eq('month', month).single().execute().data
        count = (row or {}).get('suggestions_queries', 0) + 1
        sb.table('insights_usage').update({ 'suggestions_queries': count }).eq('user_id', user_id).eq('month', month).execute()
        return { 'suggestions_queries': count }
    return res.data


def has_core_quota(user_id: str):
    sb = _get_supabase()
    month = datetime.utcnow().strftime('%Y-%m-01')
    res = sb.table('insights_usage').select('suggestions_queries').eq('user_id', user_id).eq('month', month).single().execute()
    used = (res.data or {}).get('suggestions_queries', 0)
    return (used < CORE_SUGGESTIONS_LIMIT, used)