"""Customer Sales – Products page endpoints. URLs and parameters only; logic lives in services."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.routers.dependencies import get_sales_filters
from app.schemas.products import (
    BreakdownDimension,
    BreakdownResponse,
    GiftCardsResponse,
    ItemSortField,
    ItemsTableResponse,
    ProductsKpisResponse,
    SortDirection,
)
from app.services.filters import SalesFilters
from app.services.products_breakdown import MAX_TOP_N, get_breakdown
from app.services.products_gift_cards import get_gift_cards
from app.services.products_kpis import get_products_kpis
from app.services.products_table import MAX_PAGE_SIZE, MAX_SEARCH_LENGTH, get_items_table

router = APIRouter(prefix="/products", tags=["products"])

Filters = Annotated[SalesFilters, Depends(get_sales_filters)]


@router.get("/kpis", response_model=ProductsKpisResponse)
def products_kpis(filters: Filters, align_to_complete_data: bool = True) -> ProductsKpisResponse:
    """KPI cards with year-on-year change.

    align_to_complete_data=false compares exactly the requested dates (as Looker does), even if
    the newest day has no salon data yet.
    """
    return get_products_kpis(filters, align_to_complete_data)


@router.get("/items", response_model=ItemsTableResponse)
def products_items(
    filters: Filters,
    limit: Annotated[int, Query(ge=1, le=MAX_PAGE_SIZE)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
    sort_by: ItemSortField = "revenue",
    sort_dir: SortDirection = "desc",
    search: Annotated[str, Query(max_length=MAX_SEARCH_LENGTH)] = "",
) -> ItemsTableResponse:
    """Product Category Performance table: sortable, searchable by item name, paged."""
    return get_items_table(filters, limit, offset, sort_by, sort_dir, search)


@router.get("/breakdown", response_model=BreakdownResponse)
def products_breakdown(
    filters: Filters,
    by: BreakdownDimension,
    top_n: Annotated[int, Query(ge=1, le=MAX_TOP_N)] = 10,
) -> BreakdownResponse:
    """Revenue by category, state, salon or item: top N plus 'Others'."""
    return get_breakdown(filters, by, top_n)


@router.get("/gift-cards", response_model=GiftCardsResponse)
def products_gift_cards(filters: Filters) -> GiftCardsResponse:
    """Shopify gift card sales per gift card value (aggregates, no customer details)."""
    return get_gift_cards(filters)
