# Looker Studio page inventory

Report: "Ella Baché - Report [ Global Sales ]" (Data Studio). Walked through in view mode on 24 Nov 2026.
Footer on pages: "Data Last Updated: 11/24/2026 4:06 PM (Some items on the page have not been updated)".
Three kinds of filter: **controls** (top bar), **section scopes** (hidden, per chart), **report-wide** (hidden).
Hidden chart filters cannot be seen in view mode; scopes below were reverse-engineered against BigQuery.

## Filter catalogue (each control defined once, reused by pages)

| Control | Column | Used on pages |
|---|---|---|
| Date range | `purchase_date` (others: month columns) | all |
| Product Category | `item_category` where `item_type = 'Product'` [INFERRED] | 1 |
| Treatment Category | `item_category` where `item_type = 'Service'` [INFERRED] | 2 |
| Gift Card | `is_gift_card` | 1, 5, 7 |
| Uniform | `is_uniform` | 1, 5, 7 |
| State | `state_of_transaction` | 1, 2, 5, 7 |
| Salon | `salon_name` (page 4: `salon`) | 1, 2, 4, 5, 7 |
| Active Salon | `is_salon_active` | 1, 2, 4, 5, 7 |
| Data Source | `data_source` | 1, 2, 5, 7 |
| Category (NPS) | unknown, `raw.stamped_nps*` [ASK] | 8 |
| Gift Products, Gift Type | unknown, gift product tables [ASK] | 9 |

## Pages

### 1 — Customer Sales – Products (pilot)
- **Controls:** Date, Product Category, Gift Card, Uniform, State, Salon, Active Salon, Data Source
- **Sections:** National › Total (9 KPIs incl. All-time Customer Count 1.9M) · National › Products (8 KPIs)
  · Product Category Performance table · Revenue by Products / States / Salons (pies) · Gift Card Orders in
  Shopify (customer-level table: names, emails, phones — on hold, needs access decision)
- **Scopes (verified, see `metrics.md`):** Total = `is_revenue = 1` AND `item_type` NOT IN ('Account','Shipping').
  Products = `item_type = 'Product'` (includes salon gift-card sales)

### 2 — Customer Sales – Treatments
- **Controls:** Date, Treatment Category, State, Salon, Active Salon, Data Source
- **Sections:** National › Total · National › Treatments · Treatment Category Performance table (1,203 rows)
  · Revenue by Treatments / States / Salons (pies)
- **Seen 1–24 Nov 2026:** Total $2.30M, 27K transactions, AOV $102.25, All-time 1.92M, Customers 20K,
  New Cust Rev $242.25K, Returning Cust Rev $2.00M. **Total differs from page 1 ($2.27M / 22.2K) → page 2's
  Total section uses another rule [to verify].** Treatments: Revenue $1.37M (−10.4%), Total Bookings 16,941
  (−12.8%), AOV $80.58, Customers 15K, New 1K, Returning 14K, New Cust Rev $95.86K, Returning $1.27M
- **Verified:** Treatment Revenue = `SUM(item_amount)` where `item_type = 'Service'` = $1,369,272.36;
  Total Bookings = distinct transactions = 16,941 (exact). YoY −10.4% compares 23 salon days (no 24 Nov data yet)
  with 24 days last year — Looker's YoY is pessimistic while today's salon data is missing

### 3 — Trends
- **Controls:** Date only (seen: 1 Jan 2024 – 24 Nov 2026)
- **Sections:** "Customer Trends" monthly pivot (New / Returning customers vs previous year, variance and %, per
  source: Online, Shortcuts ERP) · line charts of New vs Returning Customer Variance % for Online, Shortcuts ERP,
  Online and Shortcuts ERP · "CCA" vs previous year line chart (meaning of CCA [ASK])
- **Likely source:** `retool_reporting.customer_counts_monthly` [INFERRED]
- **Issue:** Nov 2026 (partial month) is compared with full Nov 2025, giving a false drop (−40%)

### 4 — Salons Data Year on Year Comparison
- **Controls:** Date (seen 1 Jan – 24 Nov 2026), Active Salon, Salons (not the 8 filters)
- **Sections:** "Salon wise data comparison" pivot by month: Salon, Salon Active?, Customers / LY / %Δ,
  New Customers / LY / %Δ, Returning Customers / LY / %Δ; summary rows "All Salons", "All Active Salons",
  "All Inactive Salons" · "All Salons YoY Comparison" line chart (6 series)
- **Source:** matches `retool_reporting.salons_data_yoy` columns exactly [INFERRED from columns, BQ schema checked]
- **Issue:** same partial-month problem (Nov 2026 All Salons −29% vs full Nov 2025)

### 5 — Customer Sales – Lifetime Value
- **Controls:** Date, Gift Card, Uniform, State, Salon, Active Salon, Data Source
- **Sections:** National › Total only: APV $83.59 (−2.7%), Purchase Freq (12 mth) 8.69 (+387.8%),
  Customer Value (12 mth) $725.85 (+319%), Avg Customer Lifespan (yrs) 5.35, **two cards broken** (no data)
- **Likely source:** `sv_customer` / `customer_transactions` [ASK]. The +300% YoY values look wrong [to verify]

### 6 — Ecommerce Channels
- **Controls:** Date (seen 1–30 Nov 2026)
- **Source:** direct GA4 connection (per note on page). Title "All Channel Revenue Excluding Gift Cards"
- **Sections:** Run comparison this month vs same time last year: Transaction Count, Transactions 2,106,
  Sessions 222,434, AOV $197.4, CR 0.947%, Total Revenue $415.6K · 1. Ecommerce Performance (Revenue,
  Transactions, AOV, CR% charts) · 2. Customer Conversion incl. gift cards (New vs Returning CR table: Nov
  returning 4.11% / 1,647 orders / 40,073 sessions; new 0.34% / 611 / 181,219) · CR% over time by customer type
- Must use the GA4 Data API in the new build (CLAUDE.md), not stale channel tables

### 7 — SOURCES
- **Controls:** Date, Product Category, Gift Card, Uniform, State, Salon, Active Salon, Data Source
- **Content:** one line chart, **daily**, "Total Revenue" vs "Total Revenue (previous year)", aligned by date
- **Scope (verified exact to the cent):** `SUM(item_amount)` where `item_type <> 'Shipping'` — no `is_revenue`
  filter (includes gift cards, Account, prepayments). 14 Nov 2026 $120,103.14 · 19 Nov 2026 $147,527.84
- Page name "SOURCES" does not describe the content [ASK: rename / merge with 6?]

### 8 — NPS Over Time
- **Controls:** Date (seen 1 Jan 2024 – 23 Nov 2026), Category
- **Sections:** monthly combo chart (NPS score line + stacked Promoters / Passives / Detractors bars) · table:
  Month, NPS Score, Detractors, Passives, Promoters, Total (35 months). Nov 2026: NPS 53 from 19 responses
- **Source:** `raw.stamped_nps*` [INFERRED]. Small monthly samples (10–45) → flag on the page

### 9 — Gift Products Performance
- **Controls:** Date (seen 25 Oct – 23 Nov 2026, likely "last 30 days"), Gift Products, Gift Type
- **Sections:** KPIs: Total Sales 835.3K, Total Orders 1,220, AOV $684.66, Units Given (GWP) 890, Units Given
  (Bonus Mini) 2,101 · table: Product Title, SKU, Image, Gift Type (GWP / Bonus Mini), Sales, Orders, AOV (16 rows)
- **Page note:** 4–5% variance vs BOGOS app; orders with both a GWP and a Bonus Mini count their full value under
  both, so summing sales across gift products overstates (explains the high AOV)
- **Source:** gift product tables/views (Shopify + BOGOS) [ASK]

## Report-wide filters
Not visible in view mode [ASK owner or open in edit mode].
