"""Products items table and revenue breakdowns."""

from datetime import date

import pytest

from app.services.filters import SalesFilters
from app.services.products_breakdown import get_breakdown
from app.services.products_table import get_items_table

NOV_2026 = SalesFilters(start_date=date(2026, 11, 1), end_date=date(2026, 11, 24))


def test_items_table_rows_and_paging(fake_bq):
    fake_bq.responses["products_items_table"] = [
        {
            "item_name": "Gift Certificate",
            "revenue": 87488.96,
            "orders": 620,
            "quantity": 662,
            "total_rows": 1203,
        },
        {
            "item_name": "Rejuvenating Skin Collection Xmas 2026",
            "revenue": 40232.04,
            "orders": 289,
            "quantity": 278,
            "total_rows": 1203,
        },
    ]
    table = get_items_table(NOV_2026, limit=2, offset=0)

    assert table.total_rows == 1203
    assert table.rows[1].revenue == pytest.approx(40232.04)
    params = fake_bq.calls_for("products_items_table")[0]["params"]
    assert (params["limit"], params["offset"]) == (2, 0)


def test_empty_items_table(fake_bq):
    fake_bq.responses["products_items_table"] = []
    table = get_items_table(NOV_2026)
    assert table.rows == []
    assert table.total_rows == 0


def test_breakdown_adds_others_bar(fake_bq):
    fake_bq.responses["products_breakdown_state"] = [
        {"label": "NSW", "revenue": 600.0, "grand_total": 1000.0, "group_count": 5},
        {"label": "QLD", "revenue": 300.0, "grand_total": 1000.0, "group_count": 5},
    ]
    result = get_breakdown(NOV_2026, "state", top_n=2)

    assert [bar.label for bar in result.bars] == ["NSW", "QLD", "Others"]
    assert result.bars[2].revenue == pytest.approx(100.0)
    assert result.bars[0].share == pytest.approx(0.6)


def test_breakdown_without_leftovers_has_no_others(fake_bq):
    fake_bq.responses["products_breakdown_salon"] = [
        {"label": "Bondi", "revenue": 50.0, "grand_total": 50.0, "group_count": 1},
    ]
    result = get_breakdown(NOV_2026, "salon")
    assert [bar.label for bar in result.bars] == ["Bondi"]


def test_breakdown_dimension_comes_from_whitelist(fake_bq):
    fake_bq.responses["products_breakdown_category"] = []
    get_breakdown(NOV_2026, "category")
    sql = fake_bq.calls_for("products_breakdown_category")[0]["sql"]
    assert "IFNULL(NULLIF(TRIM(item_category), ''), '(No category)') AS label" in sql
