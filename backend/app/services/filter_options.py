"""Choices for the sales filter bar (cached for a day)."""

from app.cache import cached
from app.clients import bigquery as bq
from app.config import get_settings
from app.schemas.filters import FilterOptionsResponse
from app.services.filters import CATEGORY_EXPRESSION
from app.services.freshness import SALES_TABLE
from app.services.status import data_status

OPTION_FIELDS = (
    "product_category",
    "treatment_category",
    "gift_card",
    "uniform",
    "state",
    "salon",
    "active_salon",
    "data_source",
)


def get_filter_options() -> FilterOptionsResponse:
    def compute() -> dict[str, list[str]]:
        sql = bq.load_sql("common/filter_options.sql").format(
            table=bq.table(SALES_TABLE),
            product_category=CATEGORY_EXPRESSION,
            treatment_category=CATEGORY_EXPRESSION,
        )
        rows = bq.run_query(sql, [], label="filter_options")
        row = rows[0] if rows else {}
        return {field: sorted(row.get(field) or [], key=str.casefold) for field in OPTION_FIELDS}

    result = cached("filter_options", get_settings().cache_ttl_reference_seconds, compute)
    return FilterOptionsResponse(**result.value, status=data_status(result))
