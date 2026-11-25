"""Small metric formulas shared by every page. Each formula is defined here once."""

from app.schemas.common import KpiValue


def safe_divide(numerator: float | None, denominator: float | None) -> float | None:
    if numerator is None or not denominator:
        return None
    return numerator / denominator


def change_ratio(current: float | None, previous: float | None) -> float | None:
    """Year-on-year change as a ratio: 0.05 = +5%. None when last year is zero or missing."""
    if current is None or not previous:
        return None
    return (current - previous) / previous


def kpi(current: float | None, previous: float | None) -> KpiValue:
    return KpiValue(value=current, previous=previous, change=change_ratio(current, previous))


def new_customers(customers: int | None, returning_customers: int | None) -> int | None:
    """New customers = all customers minus returning ones.

    A person with both "New" and "Returning" rows in the period counts as returning (as in Looker).
    """
    if customers is None or returning_customers is None:
        return None
    return customers - returning_customers
