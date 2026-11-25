"""Which dates a page compares, and how long results may be cached."""

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from app.config import get_settings


@dataclass(frozen=True)
class ComparisonPeriods:
    current_start: date
    current_end: date
    previous_start: date
    previous_end: date
    requested_end: date
    # True when current_end was pulled back because newer data has not arrived for every source.
    trimmed: bool


def same_date_last_year(day: date) -> date:
    """Same calendar date one year earlier; 29 Feb becomes 28 Feb."""
    try:
        return day.replace(year=day.year - 1)
    except ValueError:
        return day.replace(year=day.year - 1, day=28)


def build_comparison_periods(
    start: date, end: date, complete_through: date | None
) -> ComparisonPeriods:
    """Chosen period vs the same dates last year, both stopped at the last complete day."""
    effective_end = end
    if complete_through is not None and start <= complete_through < end:
        effective_end = complete_through
    return ComparisonPeriods(
        current_start=start,
        current_end=effective_end,
        previous_start=same_date_last_year(start),
        previous_end=same_date_last_year(effective_end),
        requested_end=end,
        trimmed=effective_end != end,
    )


def today_in_business_timezone() -> date:
    return datetime.now(ZoneInfo(get_settings().business_timezone)).date()


def cache_ttl_for(end_date: date) -> int:
    """Short cache when the period touches recent days (data still arriving), long otherwise."""
    settings = get_settings()
    if end_date < today_in_business_timezone() - timedelta(days=3):
        return settings.cache_ttl_closed_seconds
    return settings.cache_ttl_recent_seconds
