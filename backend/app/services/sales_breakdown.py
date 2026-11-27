"""Products page "Revenue by ..." charts, shown as ranked bars (top N + Others)."""

from app.cache import cached
from app.clients import bigquery as bq
from app.schemas.products import BreakdownBar, BreakdownDimension, BreakdownResponse
from app.services import metrics
from app.services.filters import (
    CATEGORY_EXPRESSION,
    SalesFilters,
    build_filter_sql,
    date_range_params,
)
from app.services.freshness import SALES_TABLE
from app.services.periods import cache_ttl_for
from app.services.status import data_status

# Whitelist: chart dimension -> SQL expression. Only these can reach the SQL text.
DIMENSIONS: dict[str, str] = {
    "category": CATEGORY_EXPRESSION,
    "state": "IFNULL(state_of_transaction, '(Unknown state)')",
    "salon": "IFNULL(salon_name, '(No salon)')",
    "item": "IFNULL(item_name, '(No name)')",
}
OTHERS_LABEL = "Others"
MAX_TOP_N = 50


def get_breakdown(
    filters: SalesFilters, dimension: BreakdownDimension, top_n: int = 10
) -> BreakdownResponse:
    top_n = max(1, min(top_n, MAX_TOP_N))

    def compute() -> list[dict]:
        filter_sql, params = build_filter_sql(filters)
        sql = bq.load_sql("products/breakdown.sql").format(
            table=bq.table(SALES_TABLE), filters=filter_sql, dimension=DIMENSIONS[dimension]
        )
        params += date_range_params(filters.start_date, filters.end_date)
        params.append(bq.scalar("top_n", "INT64", top_n))
        return bq.run_query(sql, params, label=f"products_breakdown_{dimension}")

    result = cached(
        ("products_breakdown", filters, dimension, top_n), cache_ttl_for(filters.end_date), compute
    )
    rows = result.value
    total = float(rows[0]["grand_total"] or 0.0) if rows else 0.0

    bars = [_bar(r["label"], float(r["revenue"] or 0.0), total) for r in rows]
    others = total - sum(bar.revenue for bar in bars)
    if rows and rows[0]["group_count"] > len(rows):
        bars.append(_bar(OTHERS_LABEL, others, total))

    return BreakdownResponse(
        dimension=dimension,
        start_date=filters.start_date,
        end_date=filters.end_date,
        bars=bars,
        total_revenue=total,
        status=data_status(result),
    )


def _bar(label: str, revenue: float, total: float) -> BreakdownBar:
    return BreakdownBar(label=label, revenue=revenue, share=metrics.safe_divide(revenue, total))
