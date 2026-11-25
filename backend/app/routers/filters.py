"""Filter bar choices."""

from fastapi import APIRouter

from app.schemas.filters import FilterOptionsResponse
from app.services.filter_options import get_filter_options

router = APIRouter(prefix="/filters", tags=["filters"])


@router.get("/options", response_model=FilterOptionsResponse)
def filter_options() -> FilterOptionsResponse:
    return get_filter_options()
