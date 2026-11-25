"""Response shape for the filter bar choices."""

from pydantic import BaseModel

from app.schemas.common import DataStatus


class FilterOptionsResponse(BaseModel):
    product_category: list[str]
    treatment_category: list[str]
    gift_card: list[str]
    uniform: list[str]
    state: list[str]
    salon: list[str]
    active_salon: list[str]
    data_source: list[str]
    status: DataStatus
