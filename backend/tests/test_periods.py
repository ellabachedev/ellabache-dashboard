from datetime import date

from app.services.periods import build_comparison_periods, same_date_last_year


def test_same_date_last_year():
    assert same_date_last_year(date(2026, 11, 24)) == date(2025, 11, 24)


def test_leap_day_maps_to_28_february():
    assert same_date_last_year(date(2028, 2, 29)) == date(2027, 2, 28)


def test_period_is_trimmed_to_last_complete_day():
    periods = build_comparison_periods(date(2026, 11, 1), date(2026, 11, 24), date(2026, 11, 23))
    assert periods.current_end == date(2026, 11, 23)
    assert periods.previous_start == date(2025, 11, 1)
    assert periods.previous_end == date(2025, 11, 23)
    assert periods.requested_end == date(2026, 11, 24)
    assert periods.trimmed is True


def test_closed_period_is_not_trimmed():
    periods = build_comparison_periods(date(2026, 10, 1), date(2026, 10, 31), date(2026, 11, 23))
    assert periods.current_end == date(2026, 10, 31)
    assert periods.trimmed is False


def test_no_trim_when_nothing_in_range_is_complete():
    # Asking for today only, before any salon data for today: keep the requested day.
    periods = build_comparison_periods(date(2026, 11, 24), date(2026, 11, 24), date(2026, 11, 23))
    assert periods.current_end == date(2026, 11, 24)
    assert periods.trimmed is False


def test_no_freshness_info_keeps_requested_dates():
    periods = build_comparison_periods(date(2026, 11, 1), date(2026, 11, 24), None)
    assert periods.current_end == date(2026, 11, 24)
    assert periods.trimmed is False
