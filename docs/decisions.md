# Decisions

Record answers to the open items in section 11 of CLAUDE.md here.

| Date | Decision | Decided by | Notes |
|---|---|---|---|
| 24 Nov 2026 | Products page numbers match Looker exactly first (Products figures include salon gift cards) | Default, owner can change | Note shown on the page; switching later is one line in `kpis.sql` |
| 24 Nov 2026 | "Gift Card Orders in Shopify" table (customer names, emails, phones) left out of v1 | Default | Revisit once access rules are decided (section 11, item 3) |
| 24 Nov 2026 | Pie charts become ranked bars (top N + Others) | Default (CLAUDE.md section 7) | |
| 24 Nov 2026 | "vs last year" stops at the last day every selected source has data | Default | Fairer than Looker while salon data lags; `align_to_complete_data=false` gives Looker's behaviour |
| 24 Nov 2026 | Python 3.13 (installed version) instead of 3.12 | Default | CLAUDE.md updated |
| 24 Nov 2026 | App queries live in `backend/app/queries/*.sql`, no BigQuery views or new dataset | Default | Versioned in git; no BigQuery writes needed |
| 24 Nov 2026 | UI uses a dark admin theme inspired by the Vuexy "vertical menu dark" demo (colours, Public Sans, sidebar + floating header), replacing the navy/gold palette | Owner | Values only, no template code or assets; official brand colours still [ASK] |
| 25 Nov 2026 | Colours back to Ella Baché navy + gold (replaces the Vuexy purple palette); light and dark mode and the sidebar layout stay | Owner | Dark mode = deep navy version of the same palette |
| 25 Nov 2026 | UI becomes flat Swiss style: black / white / grey + electric-blue accent, Inter, no shadows or gradients; Total and Product revenue as solid hero blocks beside hairline KPI grids; numbered sections | Owner | Replaces navy + gold. Chart palette validated with the dataviz skill checker |
| 25 Nov 2026 | Modernised filters (toolbar + filter chips), section headings (no heavy rules), ranked charts as HTML bar lists, table (soft header, rank badges) | Owner | Canvas bar charts removed; ECharts kept for future line charts |
| 25 Nov 2026 | Page 1 finished: sortable/searchable product table, Shopify gift cards as aggregates per value (no customer list), filters saved in the page address (shareable links), "to date" label on partial periods, Typeform hidden from Data Source | Default | Customer-level gift card list still waits for access rules (section 11 item 3) |
| 25 Nov 2026 | Shopify Polaris-style buttons (shared `Button`, soft bevel) and subtle motion (fade-up on load, growing bars, hover lift/tint), all off for reduced-motion users | Owner | Bevels are the one exception to "no shadows" |
| 25 Nov 2026 | Golden regression checks use October 2026 (closed month) instead of 1–24 Nov | Default | Month-to-date numbers move as late salon data arrives |
| 24 Nov 2026 | "All-time Customer Count" card not built yet | Open [ASK] | No tested rule reproduces Looker's 1.9M (distinct customers ever = 1.01M) |
