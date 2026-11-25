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
    heading: cssVar('--eb-heading'),
    label: cssVar('--eb-body'),
    grid: cssVar('--eb-line'),
    tooltipBg: cssVar('--eb-card'),
  }
}
