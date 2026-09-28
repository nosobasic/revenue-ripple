import os
from supabase import create_client

_client = None
_initialized = False


def get_supabase_admin():
    """Return a shared Supabase service-role client, or None if unset."""
    global _client, _initialized
    if _initialized:
        return _client

    _initialized = True
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("⚠️ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        return None

    try:
        _client = create_client(url, key)
    except Exception as e:
        print(f"⚠️ Failed to initialize Supabase admin client: {e}")
        _client = None
    return _client
