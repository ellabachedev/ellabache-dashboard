"""Response shapes for the Customer Sales – Products page."""

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import ComparisonPeriodInfo, DataStatus, KpiValue


class SalesKpis(BaseModel):
    revenue: KpiValue
    transactions: KpiValue
    aov: KpiValue = Field(description="Average order value = revenue / transactions")
    customers: KpiValue
    new_customers: KpiValue
    returning_customers: KpiValue
    new_customer_revenue: KpiValue
    returning_customer_revenue: KpiValue


class ProductsKpisResponse(BaseModel):
    period: ComparisonPeriodInfo
    total: SalesKpis = Field(description="National > Total: real sales, no account/shipping")
    products: SalesKpis = Field(description="National > Products: all Product rows")
    notes: list[str]
    status: DataStatus


class ItemRow(BaseModel):
    item_name: str | None
    revenue: float
    orders: int
    quantity: int


ItemSortField = Literal["revenue", "orders", "quantity", "item_name"]
SortDirection = Literal["asc", "desc"]


class ItemsTableResponse(BaseModel):
    start_date: date
    end_date: date
    rows: list[ItemRow]
    total_rows: int
    limit: int
    offset: int
    sort_by: ItemSortField
    sort_dir: SortDirection
    search: str
    status: DataStatus


class GiftCardRow(BaseModel):
    item_name: str | None
    orders: int
    quantity: int
    revenue: float


class GiftCardsResponse(BaseModel):
    start_date: date
    end_date: date
    rows: list[GiftCardRow] = Field(
        description="One row per gift card value, highest revenue first"
    )
    total_orders: int = Field(
        description="Sum of per-row orders (an order with two values counts twice)"
    )
    total_quantity: int
    total_revenue: float
    status: DataStatus


BreakdownDimension = Literal["category", "state", "salon", "item"]


class BreakdownBar(BaseModel):
    label: str
    revenue: float
    share: float | None = Field(description="Share of total product revenue: 0.25 = 25%")


class BreakdownResponse(BaseModel):
    dimension: BreakdownDimension
    start_date: date
    end_date: date
    bars: list[BreakdownBar] = Field(description="Top groups, then 'Others' if any are left out")
    total_revenue: float
    status: DataStatus
