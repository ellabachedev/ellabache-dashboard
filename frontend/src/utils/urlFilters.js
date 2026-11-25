// Read and write filter choices in the page address (?start_date=…&state=NSW&state=VIC),
// so a filtered view can be bookmarked or shared as a link.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// Build filters from a query string, falling back to `defaults` for anything missing or invalid.
// listNames: the multi-choice filters (e.g. ['state', 'salon']).
export function filtersFromSearch(search, defaults, listNames) {
  const params = new URLSearchParams(search)
  const start = params.get('start_date')
  const end = params.get('end_date')
  const datesValid = ISO_DATE.test(start ?? '') && ISO_DATE.test(end ?? '') && start <= end

  const filters = {
    ...defaults,
    start_date: datesValid ? start : defaults.start_date,
    end_date: datesValid ? end : defaults.end_date,
  }
  for (const name of listNames) {
    filters[name] = params.getAll(name).filter(Boolean)
  }
  return filters
}

// Turn filters into a query string, leaving out empty lists.
export function searchFromFilters(filters, listNames) {
  const params = new URLSearchParams()
  params.set('start_date', filters.start_date)
  params.set('end_date', filters.end_date)
  for (const name of listNames) {
    for (const value of filters[name]) params.append(name, value)
  }
  return `?${params.toString()}`
}
