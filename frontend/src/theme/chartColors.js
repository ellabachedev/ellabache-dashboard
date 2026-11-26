// Chart colours for JavaScript charts (ECharts can't read CSS classes).
// They are read from the live CSS variables in tokens.css, so charts follow light/dark mode.
// Call again after the theme changes.

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function readChartColors() {
  return {
    // Categorical series in fixed order (validated palette). One-series charts use series[0].
    series: [1, 2, 3, 4, 5, 6].map((n) => cssVar(`--eb-chart-${n}`)),
    muted: cssVar('--eb-chart-muted'), // "Others" and unknown buckets
    accent: cssVar('--eb-accent'), // brand navy for one-series bars
    accent2: cssVar('--eb-accent-2'), // second stop for one-series gradient bars
    heading: cssVar('--eb-heading'),
    label: cssVar('--eb-body'),
    subtle: cssVar('--eb-subtle'), // axis labels
    grid: cssVar('--eb-line'),
    raised: cssVar('--eb-raised'), // hover band behind a bar
    tooltipBg: cssVar('--eb-card'),
    font: getComputedStyle(document.body).fontFamily,
  }
}

// Shared tooltip look: a small card in the theme's colours (same as the app's floating menus).
export function tooltipStyle(colors) {
  return {
    backgroundColor: colors.tooltipBg,
    borderColor: colors.grid,
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: colors.heading, fontFamily: colors.font, fontSize: 12 },
    extraCssText: 'border-radius:8px;box-shadow:0 8px 24px -8px rgba(0,0,0,.25);',
  }
}
