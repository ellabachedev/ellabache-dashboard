import { apiGet } from './client.js'

// Products page endpoints. `filters` is the object from useFilters().

export function getProductsKpis(filters) {
  return apiGet('/products/kpis', filters)
}

// table: { limit, offset, sortBy, sortDir, search }
export function getProductItems(filters, table) {
  return apiGet('/products/items', {
    ...filters,
    limit: table.limit,
    offset: table.offset,
    sort_by: table.sortBy,
    sort_dir: table.sortDir,
    search: table.search,
  })
}

export function getProductsBreakdown(filters, by, topN = 10) {
  return apiGet('/products/breakdown', { ...filters, by, top_n: topN })
}

export function getProductGiftCards(filters) {
  return apiGet('/products/gift-cards', filters)
}

export function getFilterOptions() {
  return apiGet('/filters/options')
}
