-- Choices for the sales filter bar: distinct values seen in the last 3 years, one scan.
-- {product_category} and {treatment_category} are the same expressions the filters use.
SELECT
  ARRAY_AGG(DISTINCT IF(item_type = 'Product', {product_category}, NULL) IGNORE NULLS)
    AS product_category,
  ARRAY_AGG(DISTINCT IF(item_type = 'Service', {treatment_category}, NULL) IGNORE NULLS)
    AS treatment_category,
  ARRAY_AGG(DISTINCT is_gift_card IGNORE NULLS) AS gift_card,
  ARRAY_AGG(DISTINCT is_uniform IGNORE NULLS) AS uniform,
  ARRAY_AGG(DISTINCT state_of_transaction IGNORE NULLS) AS state,
  ARRAY_AGG(DISTINCT salon_name IGNORE NULLS) AS salon,
  ARRAY_AGG(DISTINCT is_salon_active IGNORE NULLS) AS active_salon,
  -- Typeform rows are $0 booking-form entries, not a sales source: hidden from the choices
  ARRAY_AGG(DISTINCT IF(data_source = 'Typeform', NULL, data_source) IGNORE NULLS) AS data_source
FROM {table}
WHERE DATE(purchase_date) >= DATE_SUB(CURRENT_DATE('Australia/Sydney'), INTERVAL 3 YEAR)
