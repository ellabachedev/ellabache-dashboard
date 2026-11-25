"""Items table sorting/search and the Shopify gift card summary."""

from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.filters import SalesFilters
from app.services.products_gift_cards import get_gift_cards
from app.services.products_table import get_items_table

NOV_2026 = SalesFilters(start_date=date(2026, 11, 1), end_date=date(2026, 11, 24))
client = TestClient(app)


def test_sort_and_search_use_whitelist_and_parameters(fake_bq):
    fake_bq.responses["products_items_table"] = []
    get_items_table(NOV_2026, sort_by="item_name", sort_dir="asc", search="  Eye cream'; DROP ")

    call = fake_bq.calls_for("products_items_table")[0]
    assert "ORDER BY LOWER(item_name) ASC, item_name" in call["sql"]
    assert "Eye cream" not in call["sql"]  # search text travels only as a parameter
    assert call["params"]["search"] == "Eye cream'; DROP"


def test_default_sort_is_revenue_descending(fake_bq):
    fake_bq.responses["products_items_table"] = []
    table = get_items_table(NOV_2026)
    assert "ORDER BY revenue DESC, item_name" in fake_bq.calls_for("products_items_table")[0]["sql"]
    assert (table.sort_by, table.sort_dir, table.search) == ("revenue", "desc", "")


def test_unknown_sort_field_is_rejected_by_the_api(fake_bq):
    response = client.get(
        "/api/products/items",
        params={"start_date": "2026-11-01", "end_date": "2026-11-24", "sort_by": "customer_email"},
    )
    assert response.status_code == 422


def test_gift_card_totals(fake_bq):
    # Values verified in BigQuery for 1–25 Nov 2026 (subset).
    fake_bq.responses["products_gift_cards"] = [
        {"item_name": "Beauty Gift Cards - $150", "orders": 80, "quantity": 78, "revenue": 11700.0},
        {"item_name": "Beauty Gift Cards - $100", "orders": 95, "quantity": 96, "revenue": 9600.0},
    ]
    result = get_gift_cards(NOV_2026)

    assert [row.item_name for row in result.rows] == [
        "Beauty Gift Cards - $150",
        "Beauty Gift Cards - $100",
    ]
    assert result.total_revenue == pytest.approx(21300.0)
    assert (result.total_orders, result.total_quantity) == (175, 174)


def test_gift_cards_query_is_fixed_to_shopify_gift_cards(fake_bq):
    fake_bq.responses["products_gift_cards"] = []
    get_gift_cards(NOV_2026.model_copy(update={"state": ("NSW",)}))
    sql = fake_bq.calls_for("products_gift_cards")[0]["sql"]
    assert "data_source = 'Shopify'" in sql
    assert "is_gift_card = 'Is Gift Card'" in sql
    assert "state_of_transaction IN UNNEST(@state)" in sql  # page filters still apply
    assert "email" not in sql.lower()  # aggregates only, no customer details
