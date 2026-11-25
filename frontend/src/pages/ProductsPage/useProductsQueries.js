import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  getFilterOptions,
  getProductGiftCards,
  getProductItems,
  getProductsBreakdown,
  getProductsKpis,
} from '../../api/products.js'

// Each hook asks TanStack Query for one piece of data. The "queryKey" includes every filter,
// so changing a filter fetches new data while identical requests come from the browser cache.
// keepPreviousData: keep showing the old numbers while new ones load (no flashing).

export function useFilterOptions() {
  return useQuery({ queryKey: ['filter-options'], queryFn: getFilterOptions, staleTime: Infinity })
}

export function useProductsKpis(filters) {
  return useQuery({
    queryKey: ['products-kpis', filters],
    queryFn: () => getProductsKpis(filters),
    placeholderData: keepPreviousData,
  })
}

// table: { limit, offset, sortBy, sortDir, search }
export function useProductItems(filters, table) {
  return useQuery({
    queryKey: ['products-items', filters, table],
    queryFn: () => getProductItems(filters, table),
    placeholderData: keepPreviousData,
  })
}

export function useProductGiftCards(filters) {
  return useQuery({
    queryKey: ['products-gift-cards', filters],
    queryFn: () => getProductGiftCards(filters),
    placeholderData: keepPreviousData,
  })
}

export function useProductsBreakdown(filters, by) {
  return useQuery({
    queryKey: ['products-breakdown', filters, by],
    queryFn: () => getProductsBreakdown(filters, by),
    placeholderData: keepPreviousData,
  })
}
