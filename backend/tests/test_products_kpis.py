"""Products KPIs: shaping, golden numbers (from verified Looker values) and caching."""

from datetime import date

import pytest

from app.clients.bigquery import DataSourceError
from app.services.filters import SalesFilters
from app.services.products_kpis import get_products_kpis

NOV_2026 = SalesFilters(start_date=date(2026, 11, 1), end_date=date(2026, 11, 24))


def test_total_section_golden_numbers(fake_bq):
    total = get_products_kpis(NOV_2026, align_to_complete_data=False).total

    assert total.revenue.value == pytest.approx(2273039.61)
    assert total.transactions.value == 22226
    assert total.aov.value == pytest.approx(102.27, abs=0.005)
    assert total.customers.value == 18698
    assert total.new_customers.value == 2027
    assert total.returning_customers.value == 16671
    # Year-on-year chips as shown in Looker.
    assert total.transactions.change == pytest.approx(-0.138, abs=0.0005)
    assert total.new_customer_revenue.change == pytest.approx(-0.295, abs=0.0005)
    assert total.new_customers.change == pytest.approx(-0.288, abs=0.0005)


def test_products_section_golden_numbers(fake_bq):
    products = get_products_kpis(NOV_2026, align_to_complete_data=False).products

    assert products.revenue.value == pytest.approx(596216.13)
    assert products.aov.value == pytest.approx(120.55, abs=0.005)
    assert products.new_customers.value == 981
    assert products.returning_customer_revenue.value == pytest.approx(467242.05)


def test_like_for_like_dates_when_salon_data_lags(fake_bq):
    response = get_products_kpis(NOV_2026)  # aligned by default

    assert response.period.end_date == date(2026, 11, 23)
    assert response.period.previous_end_date == date(2025, 11, 23)
    assert response.period.trimmed_to_complete_data is True
    params = fake_bq.calls_for("products_kpis")[0]["params"]
    assert params["current_end"] == date(2026, 11, 23)
    assert params["previous_end"] == date(2025, 11, 23)
    assert any("both years stop on the same day" in note for note in response.notes)


def test_shopify_only_uses_shopify_freshness(fake_bq):
    shopify = NOV_2026.model_copy(update={"data_source": ("Shopify",)})
    response = get_products_kpis(shopify)
    assert response.period.end_date == date(2026, 11, 24)
    assert response.period.trimmed_to_complete_data is False


def test_same_filters_hit_the_cache(fake_bq):
    get_products_kpis(NOV_2026)
    get_products_kpis(NOV_2026)
    assert len(fake_bq.calls_for("products_kpis")) == 1


def test_bigquery_outage_without_cache_raises(fake_bq):
    def fail():
        raise DataSourceError("Sales data is temporarily unavailable. Please try again.")

    fake_bq.responses["products_kpis"] = fail
    with pytest.raises(DataSourceError):
        get_products_kpis(NOV_2026, align_to_complete_data=False)


def test_missing_last_year_gives_no_change(fake_bq):
    fake_bq.responses["products_kpis"] = [fake_bq.responses["products_kpis"][0]]
    total = get_products_kpis(NOV_2026, align_to_complete_data=False).total
    assert total.revenue.previous is None
    assert total.revenue.change is None
