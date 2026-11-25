// Date helpers. Dates are plain "YYYY-MM-DD" strings, the format the API uses.

export function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// Quick date choices for the filter bar.
export function datePresets(today = new Date()) {
  const y = today.getFullYear()
  const m = today.getMonth()
  const fiscalStartYear = m >= 6 ? y : y - 1 // fiscal year starts 1 July
  return [
    { id: 'mtd', label: 'Month to date', start: new Date(y, m, 1), end: today },
    { id: 'last-month', label: 'Last month', start: new Date(y, m - 1, 1), end: new Date(y, m, 0) },
    { id: 'fytd', label: 'Fiscal year to date', start: new Date(fiscalStartYear, 6, 1), end: today },
    { id: 'last-30', label: 'Last 30 days', start: new Date(y, m, today.getDate() - 29), end: today },
  ].map((preset) => ({ ...preset, start: toIsoDate(preset.start), end: toIsoDate(preset.end) }))
}
