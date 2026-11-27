"""Products page "Product Category Performance" table (one row per item): sort, search, paging."""

from app.cache import cached
from app.clients import bigquery as bq
from app.schemas.products import ItemRow, ItemSortField, ItemsTableResponse, SortDirection
from app.services.filters import SalesFilters, build_filter_sql, date_range_params
from app.services.freshness import SALES_TABLE
from app.services.periods import cache_ttl_for
from app.services.status import data_status

MAX_PAGE_SIZE = 500
MAX_SEARCH_LENGTH = 100

# Whitelist: sort field -> SQL column. Only these can reach the ORDER BY text.
SORT_COLUMNS: dict[str, str] = {
    "revenue": "revenue",
    "orders": "orders",
    "quantity": "quantity",
    "item_name": "LOWER(item_name)",
}


def get_items_table(
    filters: SalesFilters,
    limit: int = 100,
    offset: int = 0,
    sort_by: ItemSortField = "revenue",
    sort_dir: SortDirection = "desc",
    search: str = "",
) -> ItemsTableResponse:
    limit = max(1, min(limit, MAX_PAGE_SIZE))
    offset = max(0, offset)
    search = search.strip()[:MAX_SEARCH_LENGTH]
    direction = "ASC" if sort_dir == "asc" else "DESC"
    # Item name breaks ties so paging is stable.
    order_by = f"{SORT_COLUMNS[sort_by]} {direction}, item_name"

    def compute() -> list[dict]:
        filter_sql, params = build_filter_sql(filters)
        sql = bq.load_sql("products/items_table.sql").format(
            table=bq.table(SALES_TABLE), filters=filter_sql, order_by=order_by
        )
        params += date_range_params(filters.start_date, filters.end_date)
        params += [
            bq.scalar("limit", "INT64", limit),
            bq.scalar("offset", "INT64", offset),
            bq.scalar("search", "STRING", search),
        ]
        return bq.run_query(sql, params, label="products_items_table")

    key = ("products_items_table", filters, limit, offset, sort_by, sort_dir, search)
    result = cached(key, cache_ttl_for(filters.end_date), compute)
    rows = result.value
    return ItemsTableResponse(
        start_date=filters.start_date,
        end_date=filters.end_date,
        rows=[
            ItemRow(
                item_name=r["item_name"],
                revenue=r["revenue"] or 0.0,
                orders=r["orders"] or 0,
                quantity=r["quantity"] or 0,
            )
            for r in rows
        ],
        total_rows=rows[0]["total_rows"] if rows else 0,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_dir=sort_dir,
        search=search,
        status=data_status(result),
    )
