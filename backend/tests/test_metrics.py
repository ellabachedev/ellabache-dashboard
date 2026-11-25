import pytest

from app.services.metrics import change_ratio, kpi, new_customers, safe_divide


def test_safe_divide_handles_zero_and_missing():
    assert safe_divide(10, 4) == 2.5
    assert safe_divide(10, 0) is None
    assert safe_divide(None, 4) is None


def test_change_ratio_matches_looker_chip():
    # Total Transactions 22,226 vs 25,790 shows "-13.8%" in Looker.
    assert change_ratio(22226, 25790) == pytest.approx(-0.138, abs=0.0005)


def test_change_ratio_is_none_without_last_year():
    assert change_ratio(100, 0) is None
    assert change_ratio(100, None) is None


def test_new_customers_is_total_minus_returning():
    # Looker: Customer Count 18,698 - Returning 16,671 = New 2,027.
    assert new_customers(18698, 16671) == 2027
    assert new_customers(None, 5) is None


def test_kpi_bundles_value_previous_and_change():
    value = kpi(110, 100)
    assert (value.value, value.previous) == (110, 100)
    assert value.change == pytest.approx(0.10)
