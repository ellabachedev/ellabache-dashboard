import { describe, expect, it } from 'vitest'
import { filtersFromSearch, searchFromFilters } from './urlFilters.js'

const LISTS = ['state', 'salon']
const DEFAULTS = { start_date: '2026-11-01', end_date: '2026-11-25', state: [], salon: [] }

describe('filtersFromSearch', () => {
  it('reads dates and repeated list values', () => {
    const filters = filtersFromSearch('?start_date=2026-10-01&end_date=2026-10-31&state=NSW&state=VIC', DEFAULTS, LISTS)
    expect(filters).toEqual({ start_date: '2026-10-01', end_date: '2026-10-31', state: ['NSW', 'VIC'], salon: [] })
  })

  it('falls back to defaults for missing or invalid dates', () => {
    expect(filtersFromSearch('', DEFAULTS, LISTS)).toEqual(DEFAULTS)
    expect(filtersFromSearch('?start_date=nope&end_date=2026-10-31', DEFAULTS, LISTS).start_date).toBe('2026-11-01')
    // end before start is rejected
    expect(filtersFromSearch('?start_date=2026-10-31&end_date=2026-10-01', DEFAULTS, LISTS).end_date).toBe('2026-11-25')
  })
})

describe('searchFromFilters', () => {
  it('writes a query string that reads back to the same filters', () => {
    const filters = { start_date: '2026-10-01', end_date: '2026-10-31', state: ['NSW'], salon: [] }
    const search = searchFromFilters(filters, LISTS)
    expect(search).toBe('?start_date=2026-10-01&end_date=2026-10-31&state=NSW')
    expect(filtersFromSearch(search, DEFAULTS, LISTS)).toEqual(filters)
  })
})
