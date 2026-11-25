import DataUpdated from '../../components/DataUpdated.jsx'
import FilterBar from '../../components/FilterBar.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import Reveal from '../../components/Reveal.jsx'
import { useFilters } from '../../hooks/useFilters.js'
import { toIsoDate } from '../../utils/dates.js'
import { formatDateRange } from '../../utils/format.js'
import BreakdownCharts from './BreakdownCharts.jsx'
import GiftCardsSection from './GiftCardsSection.jsx'
import ItemsTableCard from './ItemsTableCard.jsx'
import KpiSections from './KpiSections.jsx'
import { FILTER_FIELDS } from './pageConfig.js'
import { useFilterOptions, useProductsKpis } from './useProductsQueries.js'

// "1 Nov – 24 Nov 2026 (to date) compared with 1 Nov – 24 Nov 2025", from the KPI response.
// A period that runs up to today is still filling in, so it is labelled "to date" (CLAUDE.md rule).
function periodLine(period) {
  if (!period) return null
  const current = formatDateRange(period.start_date, period.end_date)
  const previous = formatDateRange(period.previous_start_date, period.previous_end_date)
  const toDate = period.requested_end_date >= toIsoDate(new Date()) ? ' (to date)' : ''
  return `${current}${toDate} compared with ${previous}`
}

// Customer Sales – Products. Layout: header → filters → KPI sections → charts → table → gift cards.
export default function ProductsPage() {
  const { filters, setFilter, setDateRange, clearChoices } = useFilters()
  const options = useFilterOptions()
  const kpis = useProductsKpis(filters)

  return (
    <>
      <PageHeader section="Customer sales" title="Products" subtitle={periodLine(kpis.data?.period)}>
        <DataUpdated status={kpis.data?.status} />
      </PageHeader>

      {/* Each block fades up in turn on first load (60 ms apart); see theme/motion.css. */}
      <div className="space-y-10">
        <Reveal step={0}>
          <FilterBar
            filters={filters}
            fields={FILTER_FIELDS}
            options={options.data}
            onFilterChange={setFilter}
            onDateChange={setDateRange}
            onClear={clearChoices}
          />
        </Reveal>
        <Reveal step={1}>
          <KpiSections query={kpis} />
        </Reveal>
        <Reveal step={2}>
          <BreakdownCharts filters={filters} />
        </Reveal>
        <Reveal step={3}>
          <ItemsTableCard filters={filters} />
        </Reveal>
        <Reveal step={4}>
          <GiftCardsSection filters={filters} />
        </Reveal>
      </div>
    </>
  )
}
