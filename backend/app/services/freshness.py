"""How up to date each sales source is (salon data usually lags Shopify by about a day)."""

from datetime import date

from app.cache import cached
from app.clients import bigquery as bq
from app.config import get_settings

SALES_TABLE = "retool_reporting.customer_transactions"


def _last_day_per_source() -> dict[str, date]:
    def compute() -> dict[str, date]:
        sql = bq.load_sql("common/source_freshness.sql").format(table=bq.table(SALES_TABLE))
        rows = bq.run_query(sql, [], label="source_freshness")
        return {row["data_source"]: row["last_day"] for row in rows}

    return cached("source_freshness", get_settings().cache_ttl_recent_seconds, compute).value


def get_complete_through(data_sources: tuple[str, ...]) -> date | None:
    """Last day that every selected source has data for (all sources when none selected).

    Sources with no data in the last 14 days are ignored so a retired source cannot freeze the date.
    """
    last_days = _last_day_per_source()
    relevant = data_sources or tuple(last_days)
    days = [last_days[source] for source in relevant if source in last_days]
    return min(days) if days else None
