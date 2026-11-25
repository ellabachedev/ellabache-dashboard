"""Real BigQuery checks against independently verified numbers (docs/metrics.md).

Run with:  RUN_INTEGRATION=1 uv run pytest -m integration
Uses your gcloud Application Default Credentials. Each run scans about 4–5 GB.

Uses a CLOSED month (October 2026) so late-arriving salon data can't move the numbers.
(The original 1–24 Nov checks drifted once 24 Nov salon sales arrived.) Small refunds or late
syncs can still nudge values, so they are checked within 0.5%.
"""

import os
from datetime import date

import pytest

from app.services.filters import SalesFilters
from app.services.products_gift_cards import get_gift_cards
from app.services.products_kpis import get_products_kpis
from app.services.products_table import get_items_table

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(os.getenv("RUN_INTEGRATION") != "1", reason="set RUN_INTEGRATION=1"),
]

# Values verified with direct BigQuery queries on 25 Nov 2026 (see docs/metrics.md).
OCT_2026 = SalesFilters(start_date=date(2026, 10, 1), end_date=date(2026, 10, 31))
SALONS_ONLY = OCT_2026.model_copy(update={"data_source": ("Shortcuts Enterprise", "Shortcuts POS")})


def test_total_section_october():
    total = get_products_kpis(OCT_2026, align_to_complete_data=False).total
    assert total.revenue.value == pytest.approx(2982098.37, rel=0.005)
    assert total.transactions.value == pytest.approx(29606, rel=0.005)
    assert total.customers.value == pytest.approx(23562, rel=0.005)


def test_products_section_salons_october():
    products = get_products_kpis(SALONS_ONLY, align_to_complete_data=False).products
    assert products.revenue.value == pytest.approx(779211.67, rel=0.005)
    assert products.transactions.value == pytest.approx(6576, rel=0.005)


def test_items_table_october():
    rows = {row.item_name: row for row in get_items_table(OCT_2026, limit=5).rows}
    assert rows["Gift Certificate"].revenue == pytest.approx(91297.48, rel=0.005)
    assert rows["Rejuvenating Skin Collection Xmas 2026"].revenue == pytest.approx(
        52205.01, rel=0.005
    )


def test_shopify_gift_cards_october():
    assert get_gift_cards(OCT_2026).total_revenue == pytest.approx(50900.0, rel=0.005)
