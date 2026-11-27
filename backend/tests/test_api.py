"""HTTP layer: routes, validation, error responses and response shapes."""

from fastapi.testclient import TestClient

from app.clients.bigquery import DataSourceError
from app.main import app

client = TestClient(app)
NOV = {"start_date": "2026-11-01", "end_date": "2026-11-24"}


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_browser_may_cache_good_answers_but_not_errors_or_health(fake_bq):
    ok = client.get("/api/products/kpis", params=NOV | {"align_to_complete_data": "false"})
    assert ok.headers["Cache-Control"] == "private, max-age=60"
    assert "Cache-Control" not in client.get("/api/health").headers
    bad = client.get(
        "/api/products/kpis", params={"start_date": "2026-11-24", "end_date": "2026-11-01"}
    )
    assert "Cache-Control" not in bad.headers


def test_kpis_endpoint_shape(fake_bq):
    response = client.get("/api/products/kpis", params=NOV | {"align_to_complete_data": "false"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"]["revenue"]["value"] == 2273039.61
    assert set(body["products"]) >= {"revenue", "aov", "new_customers"}
    assert body["status"]["stale"] is False


def test_repeated_params_select_several_values(fake_bq):
    client.get("/api/products/kpis", params=NOV | {"state": ["NSW", "VIC"]})
    params = fake_bq.calls_for("products_kpis")[0]["params"]
    assert params["state"] == ["NSW", "VIC"]


def test_bad_dates_return_422_with_plain_message(fake_bq):
    response = client.get(
        "/api/products/kpis", params={"start_date": "2026-11-24", "end_date": "2026-11-01"}
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "end_date must be on or after start_date"


def test_unknown_breakdown_dimension_is_rejected(fake_bq):
    response = client.get("/api/products/breakdown", params=NOV | {"by": "customer_email"})
    assert response.status_code == 422


def test_bigquery_outage_returns_503_friendly_message(fake_bq):
    def fail():
        raise DataSourceError("Sales data is temporarily unavailable. Please try again.")

    fake_bq.responses["products_kpis"] = fail
    response = client.get("/api/products/kpis", params=NOV | {"align_to_complete_data": "false"})
    assert response.status_code == 503
    assert response.json() == {"detail": "Sales data is temporarily unavailable. Please try again."}


def test_filter_options(fake_bq):
    fake_bq.responses["filter_options"] = [
        {
            "product_category": ["Moisturiser", "cleanser"],
            "treatment_category": [],
            "gift_card": ["Not Gift Card"],
            "uniform": [],
            "state": ["VIC", "NSW"],
            "salon": [],
            "active_salon": ["Yes", "No"],
            "data_source": ["Shopify"],
        }
    ]
    body = client.get("/api/filters/options").json()
    assert body["state"] == ["NSW", "VIC"]
    assert body["product_category"] == ["cleanser", "Moisturiser"]  # case-insensitive sort
