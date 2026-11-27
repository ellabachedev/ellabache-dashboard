// Plain-language explanations for every number on the Products page.
// Wording only: the real formulas live in the backend SQL. Keep in sync with docs/metrics.md.
// Each entry: term (the label), text (what it shows), example (optional), note (optional caveat).

// Customer figures read the same in both KPI sections; only the scope words change.
// bought: what they bought ("something" / "a product"); onlyNote: extra words for revenue.
function customerHelp({ bought, onlyNote }) {
  return {
    customers: {
      term: 'Customers',
      text: `Different people who bought ${bought}. Someone who buys 3 times counts once.`,
    },
    new_customers: {
      term: 'New customers',
      text: `People whose first-ever purchase with Ella Baché (online or in a salon) was in this period.`,
      example: 'First visit on 3 Oct and back again on 20 Oct → counted as returning, not new.',
      note: 'Salon customers with no email or phone can’t be matched, so they may count as new more than once.',
    },
    returning_customers: {
      term: 'Returning customers',
      text: 'People who had bought from Ella Baché before (online or in a salon), or bought more than once in this period.',
    },
    new_customer_revenue: {
      term: 'New customer revenue',
      text: `Money spent by new customers on the day of their first-ever purchase${onlyNote}.`,
    },
    returning_customer_revenue: {
      term: 'Returning customer revenue',
      text: `Money spent by people who had bought before${onlyNote}.`,
    },
  }
}

const aovHelp = (what) => ({
  term: 'Average order value',
  text: `Average spend per ${what}: revenue ÷ transactions.`,
  example: '$10,000 from 100 transactions = $100.',
})

// One group per KPI section (key = section id in pageConfig.js, then API field).
export const METRIC_HELP = {
  total: {
    revenue: {
      term: 'Total revenue',
      text: 'All money from real sales in salons and online: treatments, products and online gift cards.',
      note: 'Leaves out gift cards sold in salons, account payments and shipping.',
    },
    aov: aovHelp('transaction'),
    transactions: {
      term: 'Transactions',
      text: 'Separate sales: one salon receipt or one online order. An order with 3 items counts once.',
    },
    ...customerHelp({ bought: 'something', onlyNote: '' }),
  },
  products: {
    revenue: {
      term: 'Product revenue',
      text: 'Money from retail products sold in salons and online. No treatments.',
      note: 'Includes gift cards sold in salons, because the salon system records them as products.',
    },
    aov: aovHelp('transaction that included a product'),
    transactions: {
      term: 'Product transactions',
      text: 'Sales that included at least one product. A receipt with 2 products and a treatment counts once.',
    },
    ...customerHelp({ bought: 'a product', onlyNote: ' (products only)' }),
  },
}
