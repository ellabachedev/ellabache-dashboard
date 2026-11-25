# Metric definitions

Each metric is defined once (SQL view in `sql/views/` or one backend service function).
Keep this file in sync with section 4 of CLAUDE.md.

## Products page — "National > Total" KPIs

Source: `retool_reporting.customer_transactions`.
Base filter (matches the Looker Studio report, confirmed by the owner 24 Nov 2026):
`is_revenue = 1` AND `item_type` NOT IN ('Account', 'Shipping').
No `transaction_status` filter (Looker keeps Completed, Pending, Refunded, Partially Refunded, Cancelled).

| Metric | Definition | Implemented in |
|---|---|---|
| Total Revenue | `SUM(item_amount)` | not built yet |
| Total Transactions | `COUNT(DISTINCT transaction_id)` | not built yet |
| AOV | Total Revenue ÷ Total Transactions | not built yet |
| Customer Count | `COUNT(DISTINCT customer_identifier)` | not built yet |
| New Customer Revenue | `SUM(item_amount)` where `customer_type = 'New Customer'` | not built yet |
| Returning Customer Revenue | `SUM(item_amount)` where `customer_type = 'Returning Customer'` | not built yet |
| Returning Customers | `COUNT(DISTINCT customer_identifier)` where `customer_type = 'Returning Customer'` | not built yet |
| New Customers | **Customer Count − Returning Customers** (a customer with both New and Returning rows in the period counts as Returning). Counting distinct `'New Customer'` rows directly over-counts | not built yet |
| vs Last Year | Same calendar dates one year earlier, same filters | not built yet |

## Products page — "National > Products" KPIs

Base filter (reverse-engineered from Looker, verified 24 Nov 2026): `item_type = 'Product'` only.
**No `is_revenue` filter and no gift-card filter**, so salon gift-card sales (stored by Shortcuts as
`item_type = 'Product'`, `is_revenue = 0`) are included. Same formulas as the Total section.

| Metric | Definition |
|---|---|
| Product Revenue | `SUM(item_amount)` where `item_type = 'Product'` |
| Product Transactions | `COUNT(DISTINCT transaction_id)` where `item_type = 'Product'` |
| AOV - Products | Product Revenue ÷ Product Transactions |
| Customer Count / New / Returning, New/Returning Customer Revenue | As in the Total section, restricted to `item_type = 'Product'` |

Verified (Data Source = Shortcuts Enterprise + Shortcuts POS, 1–24 Nov 2026): Product Revenue
$596,216.13 (Looker $596.22K) · Transactions 4,946 (5K) · AOV $120.55 ($120.55) · Customers 4,172 (4K)
· New 981 (981) · Returning 3,191 (3K) · New Cust Rev $128,974.08 ($128.97K) · Returning Cust Rev
$467,242.05 ($467.24K). Of the $596.2K, $98.3K is gift cards (`is_gift_card` <> 'Not Gift Card').

## Treatments — Total treatment revenue

Looker filter: `item_type = 'Service'` (its "exclude Shipping" is redundant: Shipping rows are never Service).
Definition: `SUM(item_amount)` where `item_type = 'Service'`. Sources: Shortcuts Enterprise + Shortcuts POS;
Typeform rows are also `Service` but always $0 and `is_revenue = 0` (booking-form entries) — they add
nothing to revenue but would inflate transaction counts, so exclude them (`is_revenue = 1`) when counting.

Verified 24 Nov 2026: 1–23 Nov 2026 = $1,369,272.36 (Looker $1.37M); Enterprise $1,127,800.47 + POS
$241,471.89. Same dates 2025: $1,486,106.86 (−7.9%). No salon rows for 24 Nov 2026 yet (salon data lags ~1 day).

## Verified numbers (regression checks)

Period 1–24 Nov 2026 (month to date) vs 1–24 Nov 2025. Query: `sql/checks/products_total_kpis.sql`.
Small gaps vs Looker are from data refreshing between the screenshot and the query.

| Metric | Looker | BigQuery | YoY (BQ) | Verified on |
|---|---|---|---|---|
| Total Revenue | $2.27M | $2,273,039.61 | — | 24 Nov 2026 |
| Total Transactions | 22.2K (−13.8%) | 22,226 | −13.8% | 24 Nov 2026 |
| AOV | $102.25 (−0.0%) | $102.27 | −0.0% | 24 Nov 2026 |
| Customer Count | 18,703 (−13.8%) | 18,698 | −13.8% | 24 Nov 2026 |
| New Customer Revenue | $242.25K (−29.5%) | $242,253.98 | −29.5% | 24 Nov 2026 |
| Returning Customer Revenue | $2.03M (−11.5%) | $2,030,785.63 | −11.5% | 24 Nov 2026 |
| New Customers | 2,029 (−28.8%) | 2,027 | −28.8% | 24 Nov 2026 |
| Returning Customers | 16,674 (−11.6%) | 16,671 | −11.6% | 24 Nov 2026 |

Note (25 Nov 2026): these 1–24 Nov values were captured before 24 Nov salon sales arrived, so they
have since grown (e.g. Total Revenue for 1–24 Nov is now ~$2.40M). That is expected, not a bug.
Regression checks now use a closed month (below).

## Products page — table, gift cards

| Metric | Definition | Implemented in |
|---|---|---|
| Product table | One row per `item_name`, `item_type = 'Product'`; revenue = `SUM(item_amount)`, orders = distinct transactions, quantity = `SUM(item_qty)`. Sortable (revenue, orders, quantity, name); optional name search | `backend/app/queries/products/items_table.sql` |
| Gift cards sold online | Shopify only, `item_type = 'Product'`, `is_gift_card = 'Is Gift Card'` (e.g. "Beauty Gift Cards - $150"), grouped by item name. **Aggregates only**, no customer details (Looker's version lists names, emails, phones) | `backend/app/queries/products/gift_cards.sql` |
| All-time Customer Count (Looker 1.9M) | **Not built.** No tested rule reproduces it: distinct `customer_identifier` ever = 1.01M, distinct `customer_email_phone` = 0.68M, distinct `customer_id` = 0.86M, identifier per source = 1.10M (checked 25 Nov 2026). [ASK] owner | — |

## Golden numbers: October 2026 (closed month) — used by `RUN_INTEGRATION=1 uv run pytest -m integration`

Verified with direct BigQuery queries on 25 Nov 2026, independent of the app code.

| Metric | Scope | Value |
|---|---|---|
| Total Revenue | Total rule, all channels | $2,982,098.37 |
| Total Transactions | Total rule | 29,606 |
| Customer Count | Total rule | 23,562 |
| Product Revenue | Products rule, salons only (Enterprise + POS) | $779,211.67 |
| Product Transactions | Products rule, salons only | 6,576 |
| Top item revenue | "Gift Certificate" / "Rejuvenating Skin Collection Xmas 2026" | $91,297.48 / $52,205.01 |
| Shopify gift cards | Gift card rule | $50,900.00 |
