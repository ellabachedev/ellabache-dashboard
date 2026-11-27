"""App settings, read from environment variables prefixed APP_ (see .env.example)."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_REPO_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env", extra="ignore")

    gcp_project_id: str = "ellabache-singleview"
    bigquery_location: str = "australia-southeast1"
    # Hard cap per query. BigQuery refuses (and does not bill) anything bigger.
    max_bytes_billed: int = 5 * 1024**3
    query_timeout_seconds: float = 60.0

    # Cache times in seconds: recent days still change, closed periods do not.
    cache_ttl_recent_seconds: int = 10 * 60
    cache_ttl_closed_seconds: int = 12 * 60 * 60
    cache_ttl_reference_seconds: int = 24 * 60 * 60
    # How long the browser may reuse an API answer (Cache-Control max-age). Short on purpose.
    browser_cache_seconds: int = 60

    business_timezone: str = "Australia/Sydney"
    # Longest date range a page may ask for (keeps "same dates last year" from overlapping).
    max_range_days: int = 366

    # Built React files (npm run build). Served by FastAPI when the folder exists.
    frontend_dist_dir: Path = _REPO_ROOT / "frontend" / "dist"


@lru_cache
def get_settings() -> Settings:
    return Settings()
