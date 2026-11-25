-- Products page "Revenue by ..." charts: product revenue grouped by one dimension.
-- Scope: item_type = 'Product' (same as the Products KPIs).
-- {dimension} comes from a fixed whitelist in app/services/products_breakdown.py.
-- Returns the top @top_n groups plus the grand total, so the app can add an "Others" bar.
WITH grouped AS (
  SELECT
    {dimension} AS label,
    SUM(item_amount) AS revenue
  FROM {table}
  WHERE item_type = 'Product'
    AND DATE(purchase_date) BETWEEN @start_date AND @end_date
    {filters}
  GROUP BY label
)
SELECT
  label,
  revenue,
  SUM(revenue) OVER () AS grand_total,
  COUNT(*) OVER () AS group_count
FROM grouped
ORDER BY revenue DESC, label
LIMIT @top_n
