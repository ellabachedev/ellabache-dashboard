"""Shared test setup: a fake BigQuery so unit tests never touch the real project."""

from collections.abc import Callable
from datetime import date
from typing import Any

import pytest

from app import cache
from app.clients import bigquery as bq

# Verified Looker numbers, 1–24 Nov 2026 vs 1–24 Nov 2025 (docs/metrics.md), as BigQuery rows.
KPI_ROWS = [
    {
        "period": "current",
        "total_revenue": 2273039.61,
        "total_transactions": 22226,
        "total_customers": 18698,
        "total_returning_customers": 16671,
        "total_new_customer_revenue": 242253.98,
        "total_returning_customer_revenue": 2030785.63,
        "products_revenue": 596216.13,
        "products_transactions": 4946,
        "products_customers": 4172,
        "products_returning_customers": 3191,
        "products_new_customer_revenue": 128974.08,
        "products_returning_customer_revenue": 467242.05,
    },
    {
        "period": "previous",
        "total_revenue": 2638041.05,
        "total_transactions": 25790,
        "total_customers": 21700,
        "total_returning_customers": 18852,
        "total_new_customer_revenue": 343577.13,
        "total_returning_customer_revenue": 2294463.92,
        "products_revenue": 729324.16,
        "products_transactions": 6193,
        "products_customers": 5257,
        "products_returning_customers": 3890,
        "products_new_customer_revenue": 180156.16,
        "products_returning_customer_revenue": 549168.00,
    },
]

FRESHNESS_ROWS = [
    {"data_source": "Shopify", "last_day": date(2026, 11, 24)},
    {"data_source": "Shortcuts Enterprise", "last_day": date(2026, 11, 23)},
    {"data_source": "Shortcuts POS", "last_day": date(2026, 11, 23)},
]


class FakeBigQuery:
    """Answers run_query() by label and records every call for assertions."""

    def __init__(self) -> None:
        self.responses: dict[str, list[dict[str, Any]] | Callable[[], Any]] = {
            "products_kpis": KPI_ROWS,
            "source_freshness": FRESHNESS_ROWS,
        }
        self.calls: list[dict[str, Any]] = []

    def run_query(self, sql: str, params: list[bq.Param], label: str) -> list[dict[str, Any]]:
        self.calls.append({"sql": sql, "params": {p.name: p.value for p in params}, "label": label})
        response = self.responses[label]
        return response() if callable(response) else response

    def calls_for(self, label: str) -> list[dict[str, Any]]:
        return [call for call in self.calls if call["label"] == label]


@pytest.fixture(autouse=True)
def empty_cache():
    cache.clear_all()
    yield
    cache.clear_all()


@pytest.fixture
def fake_bq(monkeypatch: pytest.MonkeyPatch) -> FakeBigQuery:
    fake = FakeBigQuery()
    monkeypatch.setattr(bq, "run_query", fake.run_query)
    return fake
