from datetime import date

import pytest
from pydantic import ValidationError

from app.services.filters import SalesFilters, build_filter_sql


def make_filters(**overrides) -> SalesFilters:
    values = {"start_date": date(2026, 11, 1), "end_date": date(2026, 11, 24)} | overrides
    return SalesFilters(**values)


def test_no_choices_means_no_extra_sql():
    sql, params = build_filter_sql(make_filters())
    assert sql == ""
    assert params == []


def test_choices_become_parameters_not_sql_text():
    sql, params = build_filter_sql(make_filters(state=("NSW", "VIC"), salon=("Bondi'; DROP",)))
    assert "AND state_of_transaction IN UNNEST(@state)" in sql
    assert "AND salon_name IN UNNEST(@salon)" in sql
    assert "Bondi" not in sql  # user text never reaches the SQL
    assert {p.name: p.value for p in params} == {"state": ["NSW", "VIC"], "salon": ["Bondi'; DROP"]}


def test_blank_category_can_be_filtered():
    sql, _ = build_filter_sql(make_filters(product_category=("(No category)",)))
    assert "IFNULL(NULLIF(TRIM(item_category), ''), '(No category)')" in sql


def test_end_before_start_is_rejected():
    with pytest.raises(ValidationError, match="end_date must be on or after start_date"):
        make_filters(end_date=date(2026, 10, 31))


def test_range_longer_than_a_year_is_rejected():
    with pytest.raises(ValidationError, match="at most 366 days"):
        make_filters(start_date=date(2025, 1, 1), end_date=date(2026, 1, 2))


def test_filters_can_be_cache_keys():
    assert hash(make_filters(state=("NSW",))) == hash(make_filters(state=("NSW",)))
