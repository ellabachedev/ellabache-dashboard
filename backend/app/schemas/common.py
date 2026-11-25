"""Response pieces shared by every page."""

from datetime import date, datetime

from pydantic import BaseModel, Field


class KpiValue(BaseModel):
    value: float | None = Field(description="This period")
    previous: float | None = Field(description="Same dates last year")
    change: float | None = Field(description="Year-on-year change as a ratio: 0.05 = +5%")


class ComparisonPeriodInfo(BaseModel):
    start_date: date
    end_date: date = Field(description="Last day included (may be before the requested end)")
    previous_start_date: date
    previous_end_date: date
    requested_end_date: date
    trimmed_to_complete_data: bool = Field(
        description="True when end_date was moved back because newer data has not arrived yet"
    )


class DataStatus(BaseModel):
    fetched_at: datetime = Field(description="When BigQuery produced these numbers (UTC)")
    stale: bool = Field(description="True = BigQuery is unavailable; showing the last good result")
