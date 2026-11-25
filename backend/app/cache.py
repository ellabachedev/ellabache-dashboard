"""One small in-memory TTL cache.

Key = query name + every filter value, so each filter combination is cached separately.
If BigQuery fails, the last good value is returned and marked stale ("may be out of date").
"""

import threading
from collections.abc import Callable, Hashable
from dataclasses import dataclass
from datetime import UTC, datetime

from cachetools import TTLCache

from app.clients.bigquery import DataSourceError

_MAX_ENTRIES = 2048
_LAST_GOOD_TTL_SECONDS = 7 * 24 * 60 * 60

_lock = threading.Lock()
_fresh: dict[int, TTLCache] = {}
_last_good: TTLCache = TTLCache(maxsize=_MAX_ENTRIES, ttl=_LAST_GOOD_TTL_SECONDS)


@dataclass(frozen=True)
class CachedValue[T]:
    value: T
    fetched_at: datetime
    stale: bool = False


def cached[T](key: Hashable, ttl_seconds: int, compute: Callable[[], T]) -> CachedValue[T]:
    """Return a cached value for `key`, computing it if missing or expired."""
    with _lock:
        cache = _fresh.setdefault(ttl_seconds, TTLCache(maxsize=_MAX_ENTRIES, ttl=ttl_seconds))
        if key in cache:
            return cache[key]

    try:
        # Runs outside the lock so one slow query does not block other requests.
        value = compute()
    except DataSourceError:
        with _lock:
            previous = _last_good.get(key)
        if previous is None:
            raise
        return CachedValue(previous.value, previous.fetched_at, stale=True)

    entry = CachedValue(value, datetime.now(UTC))
    with _lock:
        cache[key] = entry
        _last_good[key] = entry
    return entry


def clear_all() -> None:
    """Empty every cache (used by tests)."""
    with _lock:
        _fresh.clear()
        _last_good.clear()
