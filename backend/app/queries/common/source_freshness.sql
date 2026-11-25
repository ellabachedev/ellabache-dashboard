-- Last day that has data, per sales source (looks back 14 days).
-- Salon data usually arrives a day later than Shopify; the app compares periods only up to
-- the last day every selected source has, so "vs last year" is like-for-like.
SELECT
  data_source,
  MAX(DATE(purchase_date)) AS last_day
FROM {table}
WHERE DATE(purchase_date) >= DATE_SUB(CURRENT_DATE('Australia/Sydney'), INTERVAL 14 DAY)
  AND data_source IN ('Shopify', 'Shortcuts Enterprise', 'Shortcuts POS')
GROUP BY data_source
