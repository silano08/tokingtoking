from supabase import create_client, Client

from config import settings

supabase: Client = create_client(settings.supabase_url, settings.supabase_key)


def get_supabase() -> Client:
    """Return a Supabase client using the service role key for admin operations."""
    return create_client(settings.supabase_url, settings.supabase_service_key or settings.supabase_key)
