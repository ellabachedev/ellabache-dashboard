"""Shared request parsing: turns the filter bar's query string into SalesFilters."""

from datetime import date
from typing import Annotated

from fastapi import HTTPException, Query
from pydantic import ValidationError

from app.services.filters import SalesFilters

FilterValues = Annotated[list[str] | None, Query()]


def get_sales_filters(
    start_date: date,
    end_date: date,
    product_category: FilterValues = None,
    treatment_category: FilterValues = None,
    gift_card: FilterValues = None,
    uniform: FilterValues = None,
    state: FilterValues = None,
    salon: FilterValues = None,
    active_salon: FilterValues = None,
    data_source: FilterValues = None,
) -> SalesFilters:
    """Repeat a parameter to pick several values, e.g. ?state=NSW&state=VIC."""
    try:
        return SalesFilters(
            start_date=start_date,
            end_date=end_date,
            product_category=tuple(product_category or ()),
            treatment_category=tuple(treatment_category or ()),
            gift_card=tuple(gift_card or ()),
            uniform=tuple(uniform or ()),
            state=tuple(state or ()),
            salon=tuple(salon or ()),
            active_salon=tuple(active_salon or ()),
            data_source=tuple(data_source or ()),
        )
    except ValidationError as err:
        messages = "; ".join(e["msg"].removeprefix("Value error, ") for e in err.errors())
        raise HTTPException(status_code=422, detail=messages) from err
