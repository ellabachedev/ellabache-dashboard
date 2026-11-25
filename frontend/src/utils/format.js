// Number and date formatting, Australian style. Display only: no metric maths here.

const LOCALE = 'en-AU'

// $2.27M, $242.25K, $9.60K, $102.25 (cents only below $1,000, e.g. average order value)
export function formatMoney(value) {
  if (value === null || value === undefined) return '—'
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return value.toLocaleString(LOCALE, { style: 'currency', currency: 'AUD', currencyDisplay: 'narrowSymbol' })
}

// 18,703 (below 100K), 1.9M / 125.4K (above)
export function formatCount(value) {
  if (value === null || value === undefined) return '—'
  if (Math.abs(value) >= 100_000) {
    return value.toLocaleString(LOCALE, { notation: 'compact', maximumFractionDigits: 1 })
  }
  return Math.round(value).toLocaleString(LOCALE)
}

// 0.137 -> "13.7%"
export function formatPercent(ratio, digits = 1) {
  if (ratio === null || ratio === undefined) return '—'
  return `${(ratio * 100).toFixed(digits)}%`
}

// -0.138 -> "−13.8%", 0.05 -> "+5.0%"
export function formatChange(ratio) {
  if (ratio === null || ratio === undefined) return '—'
  const sign = ratio > 0 ? '+' : ratio < 0 ? '−' : ''
  return `${sign}${Math.abs(ratio * 100).toFixed(1)}%`
}

// "2026-11-23" -> "23 Nov 2026"
export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// "1 Nov – 23 Nov 2026"
export function formatDateRange(startIso, endIso) {
  const start = formatDate(startIso)
  const end = formatDate(endIso)
  const sameYear = startIso.slice(0, 4) === endIso.slice(0, 4)
  return `${sameYear ? start.replace(/ \d{4}$/, '') : start} – ${end}`
}

// ISO timestamp -> "24 Nov 2026, 4:22 pm" in the viewer's time zone
export function formatDateTime(isoTimestamp) {
  return new Date(isoTimestamp).toLocaleString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
