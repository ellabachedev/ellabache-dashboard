"""Guards for the .sql files in app/queries.

Bug found 26 Nov 2026: a comment in kpis.sql mentioned the filters placeholder. Python's
str.format() fills placeholders inside comments too, so with two filters the second filter line
landed outside the comment and BigQuery failed with "Unexpected keyword AND".
"""

from datetime import date

from app.clients.bigquery import QUERIES_DIR
from app.services.filters import SalesFilters
from app.services.products_kpis import get_products_kpis


def test_no_placeholders_inside_sql_comments():
    offenders = [
        f"{path.relative_to(QUERIES_DIR)}:{number}"
        for path in QUERIES_DIR.rglob("*.sql")
        for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1)
        if line.lstrip().startswith("--") and "{" in line
    ]
    assert offenders == [], f"Curly-brace placeholders in SQL comments: {offenders}"


def test_two_filters_stay_out_of_comments(fake_bq):
    filters = SalesFilters(
        start_date=date(2026, 10, 1),
        end_date=date(2026, 10, 31),
        gift_card=("Is Gift Card",),
        data_source=("Shopify",),
    )
    get_products_kpis(filters, align_to_complete_data=False)
    sql = fake_bq.calls_for("products_kpis")[0]["sql"]

    filter_lines = [line for line in sql.splitlines() if "IN UNNEST(@" in line]
    assert len(filter_lines) == 2
    assert all(line.lstrip().startswith("AND ") for line in filter_lines)
