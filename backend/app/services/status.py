"""Turn cache metadata into the DataStatus every response carries."""

from app.cache import CachedValue
from app.schemas.common import DataStatus


def data_status(result: CachedValue) -> DataStatus:
    return DataStatus(fetched_at=result.fetched_at, stale=result.stale)
