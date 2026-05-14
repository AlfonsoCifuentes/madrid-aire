from functools import lru_cache
from typing import Any

from src.settings import get_settings


@lru_cache
def get_supabase_client() -> Any | None:
    settings = get_settings()

    if not settings.supabase_url or not settings.supabase_key:
        return None

    try:
        from supabase import create_client
    except ImportError:
        return None

    return create_client(settings.supabase_url, settings.supabase_key)
