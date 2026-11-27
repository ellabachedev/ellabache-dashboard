"""Products page KPI cards (National > Total and National > Products) with year-on-year change."""

from typing import Any

from app.cache import cached
from app.clients import bigquery as bq
from app.schemas.common import ComparisonPeriodInfo
from app.schemas.products import ProductsKpisResponse, SalesKpis
from app.services import metrics
from app.services.filters import SalesFilters, build_filter_sql
from app.services.freshness import SALES_TABLE, get_complete_through
from app.services.periods import ComparisonPeriods, build_comparison_periods, cache_ttl_for
from app.services.status import data_status


def get_products_kpis(
    filters: SalesFilters, align_to_complete_data: bool = True
) -> ProductsKpisResponse:
    complete_through = get_complete_through(filters.data_source) if align_to_complete_data else None
    periods = build_comparison_periods(filters.start_date, filters.end_date, complete_through)

    result = cached(
        ("products_kpis", filters, periods),
        cache_ttl_for(periods.current_end),
        lambda: _query_kpis(filters, periods),
    )
    rows_by_period = {row["period"]: row for row in result.value}
    current = rows_by_period.get("current", {})
    previous = rows_by_period.get("previous", {})

    return ProductsKpisResponse(
        period=_period_info(periods),
        total=_section(current, previous, "total"),
        products=_section(current, previous, "products"),
        notes=_notes(periods),
        status=data_status(result),
    )


def _query_kpis(filters: SalesFilters, periods: ComparisonPeriods) -> list[dict[str, Any]]:
    filter_sql, params = build_filter_sql(filters)
    sql = bq.load_sql("products/kpis.sql").format(table=bq.table(SALES_TABLE), filters=filter_sql)
    params += [
        bq.scalar("current_start", "DATE", periods.current_start),
        bq.scalar("current_end", "DATE", periods.current_end),
        bq.scalar("previous_start", "DATE", periods.previous_start),
        bq.scalar("previous_end", "DATE", periods.previous_end),
    ]
    return bq.run_query(sql, params, label="products_kpis")


def _section(current: dict, previous: dict, prefix: str) -> SalesKpis:
    """Build one KPI section from the `<prefix>_*` columns of the current and previous rows."""

    def values(row: dict) -> dict[str, float | None]:
        revenue = row.get(f"{prefix}_revenue")
        transactions = row.get(f"{prefix}_transactions")
        customers = row.get(f"{prefix}_customers")
        returning = row.get(f"{prefix}_returning_customers")
        return {
            "revenue": revenue,
            "transactions": transactions,
            "aov": metrics.safe_divide(revenue, transactions),
            "customers": customers,
            "new_customers": metrics.new_customers(customers, returning),
            "returning_customers": returning,
            "new_customer_revenue": row.get(f"{prefix}_new_customer_revenue"),
            "returning_customer_revenue": row.get(f"{prefix}_returning_customer_revenue"),
        }

    now, before = values(current), values(previous)
    return SalesKpis(**{name: metrics.kpi(now[name], before[name]) for name in now})


def _period_info(periods: ComparisonPeriods) -> ComparisonPeriodInfo:
    return ComparisonPeriodInfo(
        start_date=periods.current_start,
        end_date=periods.current_end,
        previous_start_date=periods.previous_start,
        previous_end_date=periods.previous_end,
        requested_end_date=periods.requested_end,
        trimmed_to_complete_data=periods.trimmed,
    )


def _notes(periods: ComparisonPeriods) -> list[str]:
    # "Includes salon gift cards" is shown as a tag on the page, so it is not repeated here.
    if not periods.trimmed:
        return []
    return [
        f"Data is complete to {periods.current_end.day} {periods.current_end:%b %Y}, "
        "so both years stop on the same day."
    ]
