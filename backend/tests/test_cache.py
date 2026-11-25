import pytest

from app import cache
from app.clients.bigquery import DataSourceError


def test_returns_last_good_value_marked_stale_when_source_fails(monkeypatch):
    first = cache.cached("key", 60, lambda: 42)
    assert (first.value, first.stale) == (42, False)

    # Expire the fresh cache but keep the last good copy, then make the source fail.
    monkeypatch.setattr(cache, "_fresh", {})

    def fail():
        raise DataSourceError("down")

    second = cache.cached("key", 60, fail)
    assert (second.value, second.stale) == (42, True)


def test_failure_with_nothing_cached_raises():
    def fail():
        raise DataSourceError("down")

    with pytest.raises(DataSourceError):
        cache.cached("never-seen", 60, fail)
