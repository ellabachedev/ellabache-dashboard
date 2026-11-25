-- Products page "Gift card orders in Shopify": aggregates per gift card value (no customer details).
-- Scope: Shopify online store, item_type = 'Product', is_gift_card = 'Is Gift Card'
--        (e.g. "Beauty Gift Cards - $150"). Checked in BigQuery 25 Nov 2026.
-- Revenue = SUM(item_amount); Orders = distinct transactions; Quantity = SUM(item_qty).
SELECT
  item_name,
  COUNT(DISTINCT transaction_id) AS orders,
  SUM(item_qty) AS quantity,
  SUM(item_amount) AS revenue
FROM {table}
WHERE data_source = 'Shopify'
  AND item_type = 'Product'
  AND is_gift_card = 'Is Gift Card'
  AND DATE(purchase_date) BETWEEN @start_date AND @end_date
  {filters}
GROUP BY item_name
ORDER BY revenue DESC, item_name
