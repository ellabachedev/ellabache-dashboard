-- Products page KPI cards: "National > Total" and "National > Products",
-- for the chosen period and the same dates one year earlier, in one scan of the table.
-- Definitions verified against Looker on 24 Nov 2026: see docs/metrics.md.
-- The table name and the filter lines are filled in by the app from a fixed whitelist;
-- user values are always @parameters. (No curly-brace placeholders in comments: they get filled too.)
WITH base AS (
  SELECT
    IF(DATE(purchase_date) BETWEEN @current_start AND @current_end, 'current', 'previous') AS period,
    transaction_id,
    customer_identifier,
    customer_type,
    item_amount,
    -- Total scope: real sales only (is_revenue = 1), excluding account payments and shipping
    (is_revenue = 1 AND IFNULL(LOWER(item_type), '') NOT IN ('account', 'shipping')) AS in_total,
    -- Products scope: every Product row, as in Looker (includes gift cards sold in salons)
    (item_type = 'Product') AS in_products
  FROM {table}
  WHERE (DATE(purchase_date) BETWEEN @current_start AND @current_end
         OR DATE(purchase_date) BETWEEN @previous_start AND @previous_end)
    {filters}
)
SELECT
  period,
  -- Revenue = sum of item amounts
  SUM(IF(in_total, item_amount, 0)) AS total_revenue,
  -- Transactions = distinct receipts
  COUNT(DISTINCT IF(in_total, transaction_id, NULL)) AS total_transactions,
  -- Customers = distinct people
  COUNT(DISTINCT IF(in_total, customer_identifier, NULL)) AS total_customers,
  COUNT(DISTINCT IF(in_total AND customer_type = 'Returning Customer', customer_identifier, NULL))
    AS total_returning_customers,
  SUM(IF(in_total AND customer_type = 'New Customer', item_amount, 0)) AS total_new_customer_revenue,
  SUM(IF(in_total AND customer_type = 'Returning Customer', item_amount, 0))
    AS total_returning_customer_revenue,

  SUM(IF(in_products, item_amount, 0)) AS products_revenue,
  COUNT(DISTINCT IF(in_products, transaction_id, NULL)) AS products_transactions,
  COUNT(DISTINCT IF(in_products, customer_identifier, NULL)) AS products_customers,
  COUNT(DISTINCT IF(in_products AND customer_type = 'Returning Customer', customer_identifier, NULL))
    AS products_returning_customers,
  SUM(IF(in_products AND customer_type = 'New Customer', item_amount, 0))
    AS products_new_customer_revenue,
  SUM(IF(in_products AND customer_type = 'Returning Customer', item_amount, 0))
    AS products_returning_customer_revenue
FROM base
GROUP BY period
