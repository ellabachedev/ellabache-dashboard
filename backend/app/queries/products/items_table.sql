-- Products page "Product Category Performance" table: one row per item name.
-- Scope: item_type = 'Product' (same as the Products KPIs; verified against Looker 24 Nov 2026).
-- Revenue = SUM(item_amount); Orders = distinct transactions; Quantity = SUM(item_qty).
-- {order_by} comes from a fixed whitelist in app/services/products_table.py.
-- @search is an optional case-insensitive "contains" match on the item name ('' = no search).
WITH items AS (
  SELECT
    item_name,
    SUM(item_amount) AS revenue,
    COUNT(DISTINCT transaction_id) AS orders,
    SUM(item_qty) AS quantity
  FROM {table}
  WHERE item_type = 'Product'
    AND DATE(purchase_date) BETWEEN @start_date AND @end_date
    AND (@search = '' OR STRPOS(LOWER(item_name), LOWER(@search)) > 0)
    {filters}
  GROUP BY item_name
)
SELECT
  item_name,
  revenue,
  orders,
  quantity,
  COUNT(*) OVER () AS total_rows
FROM items
ORDER BY {order_by}
LIMIT @limit OFFSET @offset
