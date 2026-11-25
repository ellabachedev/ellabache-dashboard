# Ella Baché Analytics Dashboard

Internal web dashboard for the marketing and business team. It replaces the Looker Studio reports.
Sales and customer data come from BigQuery. Website, email and store data come **live from APIs**
(GA4 Data API, ActiveCampaign API, Shopify API only if needed). There are **no scheduled queries,
summary tables or nightly jobs**: the backend fetches on request and caches.
Status: page 1 (Customer Sales – Products) built and tested, backend + frontend; pages 2–9 to do.

Tags used below: **[BQ]** checked in BigQuery · **[DOC]** from the team's documents, not re-checked ·
**[INFERRED]** reasoned, not confirmed · **[ASK]** unconfirmed: ask the owner, do not assume.

---

## 1. Hard rules (apply to every task)

ALWAYS
1. Check a number against its source before you report or ship it.
2. Query BigQuery for data facts. If you cannot, say "unverified". Never answer data questions from memory.
3. Pass `projectId: "ellabache-singleview"` on every BigQuery call.
4. Filter every BigQuery query by date. Select only the columns you need.
5. State scope, period, source and caveats with every number you report.
6. Define each metric once, in the backend (a SQL view, or one named service function). Never in React.
7. Lead your answer with the result, then caveats. Keep it short and in plain words.
8. Ask the owner before any big or hard-to-undo choice. Otherwise pick the sensible default and say what you chose.

NEVER
1. Never run `INSERT`, `UPDATE`, `DELETE`, `DROP` or `CREATE OR REPLACE`. Never use the read/write `execute_sql` tool. Use `execute_sql_readonly` only. Exception: a change the owner explicitly approves.
2. Never create scheduled queries, summary tables or nightly jobs. Never change IAM or production services without approval.
3. Never use `SELECT *` or scan `customer_transactions` or GA4 history without a date filter.
4. Never print, save, log or commit customer-level rows (names, emails, phones, dates of birth). Return aggregates.
5. Never put secrets in code, React, tests, docs or commits. Use Secret Manager and environment variables.
6. Never use TypeScript. The frontend is plain JavaScript (`.jsx`).
7. Never present a partial month as a full month. Label it "to date".
8. Never join `reporting` or `test_dataset` (US) with other datasets (`australia-southeast1`).

---

## 2. Project snapshot

| Layer | Choice |
|---|---|
| Backend | Python 3.13 (uv), FastAPI, Pydantic, `google-cloud-bigquery`, `cachetools` |
| Frontend | React + plain JavaScript (JSX) + Vite, React Router, TanStack Query, TanStack Table |
| Charts | Apache ECharts (or Recharts) |
| Styling | Tailwind CSS v4 (flat Swiss style, light and dark mode, see section 7), Inter Variable (`@fontsource-variable/inter`), `lucide-react` icons; all theme tokens in `frontend/src/theme/` |
| Hosting | One Cloud Run service in `australia-southeast1` (FastAPI also serves the built React files) |
| Auth | Cloud Run IAP; team members added by email |
| Secrets | Google Secret Manager |
| CI/CD | GitHub Actions or Cloud Build; staging + production |
| Quality | Ruff, pytest, ESLint, Vitest, Playwright (few end-to-end tests) |

No Redis or third-party cache. Caching = FastAPI TTL cache (key = endpoint + all filters), HTTP
headers, TanStack Query. Caching is required: it keeps API calls inside rate limits and BigQuery cheap.

```
Shopify ──(existing sync)───┐
Shortcuts ─(existing sync)──┼─▶ BigQuery (tables + views) ──┐
GA4 export (optional) ──────┘                               │
GA4 Data API ───────────────────────────────────────────────┤
ActiveCampaign API ─────────────────────────────────────────┼─▶ FastAPI on Cloud Run ─▶ React UI
Shopify API (only for live needs) ──────────────────────────┘   (cache + limits + IAP)
```
Use BigQuery for sales and customer data. Use a live API where BigQuery is stale or lacks the data.
The browser never calls BigQuery or any API directly; only the FastAPI backend does.
API routes live under `/api/*` and must be registered **before** the React catch-all route.

---

## 3. Data

### 3.1 BigQuery connection
- Use the BigQuery tools: `list_dataset_ids`, `list_table_ids`, `get_table_info` (schema, row count, last modified), `execute_sql_readonly`.
- Project: `ellabache-singleview`. Without `projectId`, BigQuery returns an unhelpful internal error.
- Location: `australia-southeast1`, except datasets `reporting` and `test_dataset` (US). [BQ]
- Queries are billed to the project. Cost rules:
  1. Call `get_table_info` before writing SQL; use real column names.
  2. Date-filter every query (`_TABLE_SUFFIX` for GA4 wildcard tables).
  3. Use `LIMIT` when sampling.
  4. If a query may scan more than ~5 GB, run it with `dryRun: true` first and report the bytes. Normal queries scan 0.3–4 GB.
  5. Set `maximum_bytes_billed` on every query in application code.
  6. Record verified numbers (month, value, query) in `docs/metrics.md` as regression checks.

### 3.2 Datasets
| Dataset | Holds |
|---|---|
| `raw` | Source copies: `shopify_*`, `shortcuts_*` / `hevo_shortcuts_*`, `ac_*` (ActiveCampaign), `stamped_nps*`, `typeform_appointment`, `skin_quiz`, `pipedrive_*`, ad data |
| `retool_reporting` | Cleaned tables: `customer_transactions`, `sv_customer`, `all_shopify_sales`, `customer_counts_monthly`, `salons_data_yoy`, many views |
| `customer_journey` | `fct_customer_journey`, cohort and repeat-purchase tables, `salon_treatment_customers`, email/SMS signup staging |
| `lookups` | Normalisation: product, service, salon name, state, dates |
| `analytics_320573631` | GA4 export: `events_intraday_YYYYMMDD` only (no finalised daily tables) |
| `application` | Gift-card coupon tables and views |
| `dashboard` | Does not exist. Create only with owner approval, for views only |

### 3.3 Key tables
**`retool_reporting.customer_transactions`** [BQ], ~13M rows, one row per sold item.
Columns: `customer_identifier`, `purchase_date`, `salon_name`, `salon_id`, `transaction_id`, `transaction_status`, `item_name`, `item_category`, `item_subcategory`, `item_type` (Product / Service / Shipping / GiftCertificate / BookingPrepayment …), `is_revenue`, `item_qty`, `item_amount`, `is_gift_card`, `is_uniform`, `is_ellabache_product`, `data_source` (Shopify / Shortcuts Enterprise / Shortcuts POS).
Has **no product ID** and **no booking-source flag**.

**`retool_reporting.sv_customer`** [BQ], ~1.28M rows, the Single View (one row per customer): identity (name, email, mobile, gender, dob, city/state/postcode), email/SMS subscription flags, source IDs (Shopify, Pipedrive, Shortcuts), order counts and values (total / online / salon; products / services / gift cards), first and last order, visited salons, products and services bought, `customer_segment`.

**GA4 booking funnel** [BQ] (in `events_intraday_*`): `shortcuts_booknow_click` → `shortcuts_selected_salon` → `shortcuts_services_selected` / `shortcuts_employee_selected` → `shortcuts_selected_date_time` → `shortcuts_booking_success`. Other events: `website_booknow_*`, `book_now_*`.

### 3.4 Freshness (checked 24 Nov 2026; re-check before relying)
| Source | State |
|---|---|
| `raw.shopify_*`, `customer_transactions`, `sv_customer`, `all_shopify_sales` | Fresh (hours) |
| GA4 `events_intraday_*` | Fresh |
| `raw.ga4_channel_data`, `raw.ga4_transactions_channel` | **Stale** (months): do not use |
| `raw.ac_*` (ActiveCampaign) | **Stale** (~22 months): use the ActiveCampaign API instead |
| `raw.shortcuts_*` legacy tables | Stale; live salon data arrives another way [ASK] |

### 3.5 Business facts
- Single View syncs to ActiveCampaign once a day via Make; a callback scenario emails the dev team a success/failure report. Customer key = email/phone match. [DOC]
- Sales sources: Shopify (online), Shortcuts Enterprise and Shortcuts POS (salons). [BQ]
- Fiscal year runs July–June (FY25/26 = Jul 2025–Jun 2026). [DOC]
- Business is Australian; GA4 daily tables appear to roll over at Sydney midnight [INFERRED]. The owner works in Asia/Kathmandu (UTC+5:45). Always state dates and time zones explicitly.

---

## 4. Metric definitions (keep `docs/metrics.md` in sync)

| Metric | Definition |
|---|---|
| **Online booking conversion rate** | `COUNT(shortcuts_booking_success) ÷ COUNT(shortcuts_booknow_click)`. Count **events**, not sessions. Divide monthly totals; never average daily percentages. Online widget only, not total salon bookings |
| **Top products** | `item_type='Product'`, `transaction_status='Completed'`, `is_revenue=1`, `is_gift_card='Not Gift Card'`; exclude freebies (`item_name LIKE '%GWP%'` or `'%100% off%'`, or amount ≤ $5). Always say **online only** or **all channels**, and **by units** or **by revenue** |
| **Top treatments** | `item_type='Service'`, completed, `is_revenue=1` (salon data) |
| **Fiscal period** | Jul–Jun; always show the period on the page |

When a metric has two valid definitions, name the scope on the chart ("online store only", "all channels").
Known good check: Oct 2026 conversion = 2,396 ÷ 17,475 = 13.7%.

---

## 5. Known data quirks (account for these; do not rediscover)

1. GA4 export has only `events_intraday_*` tables. Query them with a tight `_TABLE_SUFFIX` date filter, or use the GA4 Data API. Materialised views cannot be built on wildcard tables, so none are used.
2. GA4 days missing: 19, 20, 21 May 2026.
3. About 35% of `shortcuts_booking_success` events have no user or session ID (fired on `home.shortcutssoftware.com`; cross-domain tracking gap). Count events, not sessions, for this funnel.
4. `shortcuts_booknow_click` only exists from 15 Jun 2026. June conversion is overstated. Chart conversion from **1 Jul 2026**.
5. `website_booknow_*` events only exist from 17 Sep 2026. Adding them to the denominator lowers the rate (Oct: 13.7% → 8.3%) and creates a fake downward trend. For trends use `shortcuts_booknow_click` only, unless the chart starts 1 Oct 2026.
6. `customer_transactions` has no product ID and no online-booking flag, and `purchase_date` is the sale/visit date, not the booking-created date. GA4 bookings (~10–11% of Shortcuts treatments) cannot be matched one-to-one without a Shortcuts booking export.
7. Many items have a blank category (mostly salon sales). Product "type" labels were inferred from names: [ASK] before showing them as fact.
8. The same product appears under different names across systems (e.g. "Special Eye Cream" vs "Special Eye Cream 30mL"). Merge deliberately and say so.
9. GA4 volume swings (Jul–Sep spike, Oct drop, one 746K-event day in July) have no confirmed cause. Do not treat them as a pipeline failure.

---

## 6. Code structure

```
ellabache-dashboard/
├── CLAUDE.md
├── Dockerfile                   # multi-stage: build React, then FastAPI serves it
├── .env.example                 # setting names only, never real values
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py              # creates app, registers routers, serves React files
│   │   ├── config.py            # settings: project ID, cache times, byte limit
│   │   ├── cache.py             # one small TTL cache helper
│   │   ├── clients/             # the ONLY place each outside system is called
│   │   │   ├── bigquery.py      #   parameterised, date-filtered, byte-limited
│   │   │   ├── ga4.py           #   GA4 Data API
│   │   │   ├── activecampaign.py#   ActiveCampaign API
│   │   │   └── shopify.py       #   Shopify API (only if live data needed)
│   │   ├── queries/             # app SQL (.sql files with @parameters), one folder per page
│   │   ├── routers/             # one file per page: products.py, filters.py ...
│   │   ├── services/            # per-page logic: pick the source, shape the result
│   │   └── schemas/             # shape of each API response
│   └── tests/
├── frontend/
│   ├── package.json
│   └── src/
│       ├── main.jsx, App.jsx    # start the app; layout + routes
│       ├── api/                 # the ONLY place that calls /api
│       ├── pages/               # one folder per page (ProductsPage/, TreatmentsPage/ ...)
│       ├── components/          # KpiCard, DataTable, ChartCard, FilterBar
│       ├── hooks/               # useFilters, useDateRange
│       ├── utils/               # formatters: money, percent, dates
│       └── theme/               # the only place colours, fonts, spacing are defined
├── sql/
│   ├── views/                   # one .sql file per view
│   └── checks/                  # queries that prove a number is right
└── docs/                        # metrics.md, decisions.md
```

**Request flow (each layer talks only to the next):** React page → function in `frontend/src/api/` → router → service → client → BigQuery view or API.
A page never calls BigQuery or an API. A router never contains SQL. React never contains a metric formula.

### Conventions
- **One job per file.** Split any file over ~200 lines or doing two things.
- **Name by what it is:** `get_monthly_conversion()`, `KpiCard`, `useDateRange`.
- **No copy-paste between pages.** Shared code goes in `components/`, `hooks/` or `utils/`.
- **Cache times** (in `config.py`): live GA4 / ActiveCampaign / today's data 5–15 min; closed past months 6–24 h.
- **Errors:** API returns a clear message and status code. The page shows a friendly error and a retry button, never raw errors or stack traces. If an outside API is down or rate-limited, show the last cached value labelled "may be out of date".
- **Python:** type hints, Pydantic response models, Ruff, no business logic in routers, parameterised queries only (never build SQL from user input).
- **React:** functional components, data via TanStack Query (never fetch inside components), no hard-coded colours (use theme tokens). Write simple, readable code with short files and clear names, and put a one-line comment above anything non-obvious. The owner is not experienced with JavaScript or TypeScript: explain any new concept in one or two plain sentences when you introduce it.
- **SQL:** snake_case, explicit columns, a comment above each metric stating its definition, always date-filtered.
- **Git:** small branches, conventional commits (`feat:`, `fix:`, `docs:`), PR text says what changed and how numbers were verified.
- **Tests:** unit-test metric logic and API schemas, one end-to-end test per page, keep golden numbers (section 4) as regression checks.

---

## 7. UI rules

**Style: flat Swiss design** (owner's choice, 25 Nov 2026). Black, white and greys with one vibrant
electric-blue accent; strict grid; Inter (bold, tight headings); hairline rules; **no shadows, no
gradients**, soft 12px corners. Headline numbers sit on solid "hero" blocks. Official Ella Baché brand
colours and logo are still [ASK]; change them only in `frontend/src/theme/tokens.css`.

**Light and dark mode** (both required on every page). The switch is in each page header; the choice is
saved in the browser, and the first visit follows the computer's setting. Palettes are CSS variables
(`--eb-*`) in `tokens.css`, mapped to Tailwind names (`bg-card`, `text-heading` …), so components never
mention a theme: use the token classes and both modes work.

| Token | Light | Dark |
|---|---|---|
| page / card / raised | `#F4F4F5` / `#FFFFFF` / `#F4F4F5` | `#09090B` / `#111113` / `#18181B` |
| hairline / strong rule (section tops, table head) | `#E4E4E7` / `#09090B` | `#27272A` / `#FAFAFA` |
| heading / body text (high contrast) | `#09090B` / `#3F3F46` | `#FAFAFA` / `#C4C4CC` |
| subtle (icons, placeholders, small hints) | `#71717A` | `#8B8B95` |
| sidebar text / sidebar muted | `#D4D4D8` / `#8B8B95` | same |
| accent (electric blue: bars, section numbers, links, focus) | `#2F52F5` | `#5D7CFF` |
| hero Total block / text | `#09090B` / white | `#FAFAFA` / `#09090B` (inverted) |
| hero Products block / text | `#2F52F5` / white | `#3D5EFF` / white |
| positive / negative (change chips only) | `#0A8A4A` / `#D92D20` | `#34C37A` / `#F2544B` |
| sidebar (black in both modes) | `#09090B` | `#000000` |

Each status colour has a tint (`*-subtle`) and a readable text-on-tint (`*-ink`), chosen per mode to pass 4.5:1.
Chart categorical series, fixed order, validated with the dataviz skill's checker (all six checks pass):
light `#2F52F5, #E4720B, #0F9A6C, #9B45E6, #E0427E, #7D8F12`; dark `#5D7CFF, #D0731F, #26A077, #A774F0, #E05A8B, #86992B`.
One-series charts use series 1 only; "Others" / unknown buckets use `--eb-chart-muted` (grey).
Charts read colours from the live CSS variables (`theme/chartColors.js`) and redraw when the theme changes.
Font: Inter Variable with optical sizing (`@fontsource-variable/inter/opsz.css`): big text automatically
uses the tighter display shapes. Features `cv11` + `ss01`. Big standalone numbers bold with tight tracking and proportional digits;
tabular digits only in tables. Icons: `lucide-react`, thin and neutral (colour carries meaning, not decoration).

- Sidebar (black, both modes): blue logo tile + "Ella Baché / Analytics", grouped menu (uppercase group labels), active item = soft white highlight with a blue marker on the left, unbuilt pages show a "Soon" pill, user block at the bottom. Full width (256px) from `xl`; **icon rail (72px) on laptops (`lg`)** with labels as tooltips; hidden on phones (brand bar instead).
- Page top: a **sticky, see-through top bar** (breadcrumb "Section › Page" on the left; "Updated …" pill and theme switch on the right), then the big title (48px, bold, tight) with the compared period underneath → filter toolbar → sections.
- Change chips read "▼ −9.3% from 25,791"; the section description says "changes vs same dates last year", so the chip line never wraps.
- Filter toolbar (`FilterBar`): segmented period switch (soft track, active option raised) + one compact date-range field; below it one **filter chip** per filter (`MultiSelect`: dashed "+ State" when empty, filled "State | NSW +1 ×" when active, checkbox menu with search), "Clear all" on the right.
- Sections start with `SectionTitle`: semibold title + one-line description underneath. No heavy rules.
- KPI sections: `HeroMetric` (solid block, 4 of 12 columns: headline value, change chip, this-year vs last-year bars, AOV) beside a `KpiGrid` of `KpiCard` cells (8 columns, cells separated by 1px hairlines; label row reserves two lines so values align).
- Ranked categories: `BarList` (HTML, not canvas): each row has a soft accent bar behind the label, value + share on the right; "Others" / unknown rows in grey. Use ECharts only for real charts (trends → line).
- Tables: `DataTable` inside a `flush` `ChartCard`: soft grey header row, divider lines, rank badges (top 3 in accent; only when sorted by the main measure), first column medium weight, `bar: true` on the main measure, `sortable` headers (sort is done by the backend from a whitelist), a `SearchInput` in the card's `actions` (debounced, backend search), "1–15 of N items" + Previous / Next.
- Filters live in the page address (`?start_date=…&state=NSW`), so any view can be bookmarked or shared.
- Panels: `bg-card`, `rounded-card` (12px), 1px `border-line`, no shadow (only floating menus have one).
- **Buttons: always `components/Button.jsx`** (Shopify Polaris-style, owner's choice 25 Nov 2026; styles in `theme/buttons.css`, colours in `tokens.css`): `primary` = solid black (white in dark mode) for the main action, `secondary` = white for everyday actions, `ghost` = text-only; sizes `md`/`sm`; `icon` for square icon buttons (with `aria-label`). Soft bevel (inner highlight + hairline edge), hover tints the face, pressing moves it down 1px. These bevels are the one allowed exception to "no shadows". Inputs get the subtle inset `--eb-input-shadow`; the segmented switch's active option uses the secondary-button look.
- **Motion** (`theme/motion.css`, all off when the user prefers reduced motion): blocks fade up in turn on load (`Reveal step={n}`, 60 ms apart); bars grow from zero (`bar-grow`); hero blocks rise 2px on hover (`hover-lift`); KPI cells tint and their icon turns accent on hover; menu icons nudge right; bar-list rows deepen on hover; chips lift 1px. Use `animation-fill-mode: backwards` (never `both`), or finished animations trap dropdowns under the next block.
- Responsive grid (the sidebar takes 240px from `lg`, so content is narrower than the viewport). Check every page at 1440, 1024 and 390 px with `node e2e/screenshots.mjs <dir> "1440,1024,390"`, which also flags sideways overflow:
  - `xl` (≥1280): hero 4/12 beside KPI grid 8/12 (3 columns); 3 chart panels in a row.
  - `md`–`lg`: hero full width with its two halves side by side; KPI grid 3 columns; charts 2 columns, last panel spans both.
  - phone: brand top bar (sidebar hidden), period switch 2×2, KPI grid 2 columns, everything else stacked; tables scroll sideways inside their panel (names never wrap).
- Shared building blocks (reuse on every page): `Layout`, `PageHeader`, `SectionTitle`, `FilterBar`/`MultiSelect`, `HeroMetric`, `KpiGrid`/`KpiCard`, `ChangeChip`, `ChartCard`, `BarList`, `DataTable`, `SearchInput`, `Button`, `Reveal`, `StateViews`, `DataUpdated`; tones via `theme/tones.js`.
- Every page: filters → KPI cards → charts → table.
- KPI card: label, large value, "vs last year" chip with arrow **and** colour (never colour alone).
- Bars start at zero. Do not truncate a line chart's axis unless it is labelled.
- Title every chart with scope + period + source (e.g. "Online booking conversion rate — booking widget, GA4 — Jul 2026 onward; Nov = month to date").
- Mark partial months "to date". Show "Data updated …" on every page.
- Number format: `$2.27M`, `22.2K`, `13.7%`, Australian locale, tabular figures, right-aligned.
- Accessibility: text contrast ≥ 4.5:1, visible focus ring, charts readable in greyscale.
- Chart choice: trend → line; compare categories → bar; share of total only with ≤5 parts; no pie or gauge for a single rate.
- Every page needs loading, empty and error states.

---

## 8. Pages to migrate (from Looker Studio), in build order

| # | Page | Likely source |
|---|---|---|
| 1 | Customer Sales – Products (pilot; build first) | `customer_transactions` |
| 2 | Customer Sales – Treatments | `customer_transactions` |
| 3 | Trends | `customer_counts_monthly`, sales |
| 4 | Salons Data Year on Year | `retool_reporting.salons_data_yoy` |
| 5 | Customer Sales – Lifetime Value | `sv_customer` |
| 6 | Ecommerce Channels | GA4 API + Shopify |
| 7 | SOURCES (maybe merge with 6) | GA4 API |
| 8 | NPS Over Time | `raw.stamped_nps*` |
| 9 | Gift Products Performance | gift product tables/views |

Pages 6 and 7 must use the GA4 Data API (or `events_intraday_*`), never the stale channel tables.
The Products page has 8 global filters (date, product category, gift card, uniform, state, salon, active salon, data source), ~17 KPI cards with year-on-year change, a ranked table and bar charts by product / state / salon. [ASK] which pages are still used before building.

---

## 9. Playbooks (follow these steps)

**A. Answer a data question**
1. Identify the table(s); call `get_table_info`.
2. Write a date-filtered query selecting only needed columns; dry-run if large.
3. Run with `execute_sql_readonly`.
4. Check the result against section 5 quirks and a second source if one exists.
5. Report: number, table, filters, date range, caveats, and (for marketing) what changed, the likely reason with your confidence, and one action to test.

**B. Add or change a metric**
1. Write the definition in section 4 / `docs/metrics.md`.
2. Implement it once (SQL view in `sql/views/`, or one service function).
3. Add a golden-number test and a `sql/checks/` query.
4. Compare with the existing Looker page or source for one full month.

**C. Add a dashboard page**
1. Copy the Products page pattern: client function or SQL view → service → router → `api/` function → page folder.
2. Use the shared `FilterBar`, `KpiCard`, `DataTable`, `ChartCard`.
3. Add cache, loading, empty and error states, and the "Data updated" label.
4. Done when: numbers match the source for one full month, tests pass, bytes scanned checked, accessible, reviewed.

**D. Report to the marketing team**
Give what changed, why it likely changed (state your confidence), and one action to test. Report correlations as correlations, flag small samples, never show a partial month as full. Useful questions: which products and treatments drive repeat purchase; where bookings drop off (Book now → salon → service → time → success); which channels bring high-value customers; which `customer_segment` groups are lapsing; whether the Single View → ActiveCampaign sync keeps lists current.

---

## 10. Security

- Aggregate by default. Show customer-level lists only to authorised users and only where a page needs them.
- Service accounts get least privilege (BigQuery Data Viewer + Job User on needed datasets only).
- Third-party tokens (ActiveCampaign, Shopify, GA4 service account) are read-only and kept in Secret Manager.
- Keep a BigQuery budget alert on the project.

---

## 11. Open decisions and unconfirmed items (record answers in `docs/decisions.md`)

1. ActiveCampaign is read live (decided). [ASK] which numbers are needed, given its rate limits.
2. [ASK] which pages are dropped or merged.
3. [ASK] who signs in, and whether per-salon access is needed.
4. [ASK] official brand colours and logo.
5. [ASK] when GA4 API and BigQuery numbers differ, which is the official figure.
6. [ASK] GA4 property time zone.
7. [ASK] how live salon data reaches BigQuery (the legacy `raw.shortcuts_*` tables are stale).

Risks: metric disagreement between sources, scope creep, one-person knowledge, BigQuery cost from unfiltered queries, API rate limits (GA4, ActiveCampaign, Shopify).

---

## 12. Commands (verified 25 Nov 2026)

```
backend (in backend/):
  run:       uv run fastapi dev app/main.py          (API docs at http://localhost:8000/docs)
  tests:     uv run pytest                           (unit tests, fake BigQuery, free)
  golden:    RUN_INTEGRATION=1 uv run pytest -m integration   (real BigQuery, October 2026, ~5 GB)
  lint:      uv run ruff check .  |  uv run ruff format .
frontend (in frontend/):
  run:       npm run dev        (http://localhost:5173, proxies /api to :8000)
  tests:     npm test           (Vitest unit tests)
  e2e:       npm run test:e2e   (Playwright, needs both servers running; real data)
  review:    npm run screenshots -- <dir> "1440,1024,390" light,dark
  lint/build: npm run lint  |  npm run build
container (repo root, Docker Desktop running):
  build:     docker build -t ellabache-dashboard .   (not yet test-built: Docker daemon was off)
deploy:      gcloud run deploy ellabache-dashboard --source . --region australia-southeast1   (owner approval first)
```



######
https://demos.pixinvent.com/vuexy-html-admin-template/html/vertical-menu-template-dark/