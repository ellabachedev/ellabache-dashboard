"""Sales filter bar → one parameterised SQL fragment.

Column expressions come from the fixed whitelist below. User choices only ever travel as
query parameters, never as SQL text.
"""

from datetime import date

from pydantic import BaseModel, ConfigDict, model_validator

from app.clients.bigquery import Param, array, scalar
from app.config import get_settings

NO_CATEGORY = "(No category)"
# Blank categories (common for salon items) get a visible label so they can be filtered.
CATEGORY_EXPRESSION = f"IFNULL(NULLIF(TRIM(item_category), ''), '{NO_CATEGORY}')"

# Filter name -> SQL expression on retool_reporting.customer_transactions.
FILTER_COLUMNS: dict[str, str] = {
    "product_category": CATEGORY_EXPRESSION,
    "treatment_category": CATEGORY_EXPRESSION,
    "gift_card": "is_gift_card",
    "uniform": "is_uniform",
    "state": "state_of_transaction",
    "salon": "salon_name",
    "active_salon": "is_salon_active",
    "data_source": "data_source",
}


class SalesFilters(BaseModel):
    """Choices from a sales page's filter bar. An empty tuple means "all"."""

    # frozen = values can't change after creation, which also makes it usable as a cache key.
    model_config = ConfigDict(frozen=True)

    start_date: date
    end_date: date
    product_category: tuple[str, ...] = ()
    treatment_category: tuple[str, ...] = ()
    gift_card: tuple[str, ...] = ()
    uniform: tuple[str, ...] = ()
    state: tuple[str, ...] = ()
    salon: tuple[str, ...] = ()
    active_salon: tuple[str, ...] = ()
    data_source: tuple[str, ...] = ()

    @model_validator(mode="after")
    def check_dates(self) -> "SalesFilters":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        max_days = get_settings().max_range_days
        if (self.end_date - self.start_date).days + 1 > max_days:
            raise ValueError(f"date range can be at most {max_days} days")
        return self


def build_filter_sql(filters: SalesFilters) -> tuple[str, list[Param]]:
    """Return ('AND col IN UNNEST(@name) ...', params) for every filter that has choices."""
    clauses: list[str] = []
    params: list[Param] = []
    for name, expression in FILTER_COLUMNS.items():
        values = getattr(filters, name)
        if values:
            clauses.append(f"AND {expression} IN UNNEST(@{name})")
            params.append(array(name, "STRING", values))
    return "\n    ".join(clauses), params


def date_range_params(start: date, end: date) -> list[Param]:
    return [scalar("start_date", "DATE", start), scalar("end_date", "DATE", end)]
