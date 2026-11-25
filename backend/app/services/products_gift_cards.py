"""Products page "Gift card orders in Shopify": totals per gift card value.

Aggregates only. The Looker version lists customers (names, emails, phones); that stays out until
access rules are decided (CLAUDE.md sections 1 and 10).
"""

from app.cache import cached
from app.clients import bigquery as bq
from app.schemas.products import GiftCardRow, GiftCardsResponse
from app.services.filters import SalesFilters, build_filter_sql, date_range_params
from app.services.freshness import SALES_TABLE
from app.services.periods import cache_ttl_for
from app.services.status import data_status


def get_gift_cards(filters: SalesFilters) -> GiftCardsResponse:
    def compute() -> list[dict]:
        filter_sql, params = build_filter_sql(filters)
        sql = bq.load_sql("products/gift_cards.sql").format(
            table=bq.table(SALES_TABLE), filters=filter_sql
        )
        params += date_range_params(filters.start_date, filters.end_date)
        return bq.run_query(sql, params, label="products_gift_cards")

    result = cached(("products_gift_cards", filters), cache_ttl_for(filters.end_date), compute)
    rows = [
        GiftCardRow(
            item_name=r["item_name"],
            orders=r["orders"] or 0,
            quantity=r["quantity"] or 0,
            revenue=r["revenue"] or 0.0,
        )
        for r in result.value
    ]
    return GiftCardsResponse(
        start_date=filters.start_date,
        end_date=filters.end_date,
        rows=rows,
        total_orders=sum(row.orders for row in rows),
        total_quantity=sum(row.quantity for row in rows),
        total_revenue=sum(row.revenue for row in rows),
        status=data_status(result),
    )
