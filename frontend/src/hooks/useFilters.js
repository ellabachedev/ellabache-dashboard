import { useEffect, useState } from 'react'
import { datePresets } from '../utils/dates.js'
import { filtersFromSearch, searchFromFilters } from '../utils/urlFilters.js'

// Filter names match the API query parameters exactly.
export const EMPTY_CHOICES = {
  product_category: [],
  gift_card: [],
  uniform: [],
  state: [],
  salon: [],
  active_salon: [],
  data_source: [],
}
const LIST_NAMES = Object.keys(EMPTY_CHOICES)

function defaultFilters() {
  const monthToDate = datePresets()[0]
  return { start_date: monthToDate.start, end_date: monthToDate.end, ...EMPTY_CHOICES }
}

// A "hook" is a reusable function that keeps state for a component.
// This one holds the filter bar choices and gives functions to change them.
// The choices are mirrored in the page address, so a filtered view can be shared as a link.
export function useFilters() {
  const [filters, setFilters] = useState(() =>
    filtersFromSearch(window.location.search, defaultFilters(), LIST_NAMES),
  )

  // Keep the address bar in step with the filters (replaceState: no extra Back-button entries).
  useEffect(() => {
    const search = searchFromFilters(filters, LIST_NAMES)
    if (search !== window.location.search) {
      window.history.replaceState(null, '', `${window.location.pathname}${search}`)
    }
  }, [filters])

  const setFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }))
  const setDateRange = (start, end) =>
    setFilters((current) => ({ ...current, start_date: start, end_date: end }))
  const clearChoices = () => setFilters((current) => ({ ...current, ...EMPTY_CHOICES }))

  return { filters, setFilter, setDateRange, clearChoices }
}
