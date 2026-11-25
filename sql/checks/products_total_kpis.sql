-- Check: Products page "National > Total" KPIs, 1–24 Nov 2026 vs 1–24 Nov 2025.
-- Base filter (matches Looker): is_revenue = 1, item_type not 'Account' or 'Shipping'.
-- Expected 2026 (24 Nov 2026): revenue 2,273,039.61 · transactions 22,226 · customers 18,698
--   · returning 16,671 · new 2,027. See docs/metrics.md. Scans ~1.2 GB.
SELECT
  EXTRACT(YEAR FROM purchase_date) AS yr,
  -- Total Revenue = sum of item amounts
  ROUND(SUM(item_amount), 2) AS total_revenue,
  -- Total Transactions = distinct transaction IDs
  COUNT(DISTINCT transaction_id) AS total_transactions,
  -- AOV = revenue / transactions
  ROUND(SUM(item_amount) / COUNT(DISTINCT transaction_id), 2) AS aov,
  -- Customer Count = distinct customers
  COUNT(DISTINCT customer_identifier) AS customer_count,
  ROUND(SUM(IF(customer_type = 'New Customer', item_amount, 0)), 2) AS new_customer_revenue,
  ROUND(SUM(IF(customer_type = 'Returning Customer', item_amount, 0)), 2) AS returning_customer_revenue,
  COUNT(DISTINCT IF(customer_type = 'Returning Customer', customer_identifier, NULL)) AS returning_customers,
  -- New Customers = all customers minus returning customers
  COUNT(DISTINCT customer_identifier)
    - COUNT(DISTINCT IF(customer_type = 'Returning Customer', customer_identifier, NULL)) AS new_customers
FROM `ellabache-singleview.retool_reporting.customer_transactions`
WHERE is_revenue = 1
  AND IFNULL(LOWER(item_type), '') NOT IN ('account', 'shipping')
  AND (DATE(purchase_date) BETWEEN '2026-11-01' AND '2026-11-24'
       OR DATE(purchase_date) BETWEEN '2025-11-01' AND '2025-11-24')
GROUP BY yr
ORDER BY yr;
