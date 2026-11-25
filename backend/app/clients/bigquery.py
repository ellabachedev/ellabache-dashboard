"""BigQuery client: the ONLY place the app talks to BigQuery.

Every query is parameterised (user values never enter the SQL text), byte-limited and labelled.
"""

import logging
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

from google.api_core import exceptions as google_errors
from google.auth import exceptions as auth_errors
from google.cloud import bigquery

from app.config import get_settings

log = logging.getLogger(__name__)

QUERIES_DIR = Path(__file__).resolve().parent.parent / "queries"


class DataSourceError(Exception):
    """BigQuery could not answer. The message is safe to show to users."""


@dataclass(frozen=True)
class Param:
    """One query parameter. `type` is a BigQuery type: STRING, DATE, INT64, FLOAT64."""

    name: str
    type: str
    value: Any
    is_array: bool = False


def scalar(name: str, type_: str, value: Any) -> Param:
    return Param(name, type_, value)


def array(name: str, type_: str, values: list | tuple) -> Param:
    return Param(name, type_, list(values), is_array=True)


def table(dataset_table: str) -> str:
    """Fully qualified, quoted table name, e.g. table('retool_reporting.customer_transactions')."""
    return f"`{get_settings().gcp_project_id}.{dataset_table}`"


@lru_cache
def load_sql(relative_path: str) -> str:
    """Read a .sql file from app/queries/."""
    return (QUERIES_DIR / relative_path).read_text(encoding="utf-8")


@lru_cache
def _client() -> bigquery.Client:
    settings = get_settings()
    return bigquery.Client(project=settings.gcp_project_id, location=settings.bigquery_location)


def _to_bigquery(param: Param) -> bigquery.ScalarQueryParameter | bigquery.ArrayQueryParameter:
    if param.is_array:
        return bigquery.ArrayQueryParameter(param.name, param.type, param.value)
    return bigquery.ScalarQueryParameter(param.name, param.type, param.value)


def run_query(sql: str, params: list[Param], label: str) -> list[dict[str, Any]]:
    """Run a read-only query and return rows as dicts.

    `label` (lowercase letters, digits, underscores) names the query in logs and job labels.
    """
    settings = get_settings()
    job_config = bigquery.QueryJobConfig(
        query_parameters=[_to_bigquery(p) for p in params],
        maximum_bytes_billed=settings.max_bytes_billed,
        labels={"app": "ellabache-dashboard", "query": label},
    )
    try:
        job = _client().query(sql, job_config=job_config)
        rows = job.result(timeout=settings.query_timeout_seconds)
    except (google_errors.GoogleAPIError, auth_errors.GoogleAuthError, TimeoutError) as err:
        log.exception("BigQuery query '%s' failed", label)
        raise DataSourceError("Sales data is temporarily unavailable. Please try again.") from err

    log.info("bigquery query=%s bytes_processed=%s", label, job.total_bytes_processed)
    return [dict(row.items()) for row in rows]
