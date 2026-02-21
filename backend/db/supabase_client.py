from supabase import create_client, Client

from config import settings

# Use service role key for all backend operations.
# The backend handles its own auth via JWT middleware,
# so Supabase RLS (which requires Supabase Auth) must be bypassed.
_key = settings.supabase_service_key or settings.supabase_key
supabase: Client = create_client(settings.supabase_url, _key)


def get_supabase() -> Client:
    """Return the Supabase client (service role)."""
    return supabase
