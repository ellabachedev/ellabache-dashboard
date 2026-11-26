import { CalendarDays, History } from 'lucide-react'
import DataUpdated from '../../components/DataUpdated.jsx'
import FilterBar from '../../components/FilterBar.jsx'
import NoteList from '../../components/NoteList.jsx'
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

// Two tags under the title: this period (accent) and the period it is compared with.
// A period that runs up to today is still filling in, so it is labelled "to date" (CLAUDE.md rule).
function periodTags(period) {
  if (!period) return []
  const current = formatDateRange(period.start_date, period.end_date)
  const previous = formatDateRange(period.previous_start_date, period.previous_end_date)
  const toDate = period.requested_end_date >= toIsoDate(new Date()) ? ' (to date)' : ''
  return [
    { label: `${current}${toDate}`, icon: CalendarDays, tone: 'accent' },
    { label: `vs ${previous}`, icon: History },
  ]
}

// Customer Sales – Products. Layout: header → filters → KPI sections → charts → table → gift cards.
export default function ProductsPage() {
  const { filters, setFilter, setDateRange, clearChoices } = useFilters()
  const options = useFilterOptions()
  const kpis = useProductsKpis(filters)

  return (
    <>
      <PageHeader
        section="Customer sales"
        title="Products"
        subtitle="Product revenue, customers and best sellers across salons and the online store."
        tags={periodTags(kpis.data?.period)}
      >
        <DataUpdated status={kpis.data?.status} />
      </PageHeader>

      {/* Each block fades up in turn on first load (60 ms apart); see theme/motion.css. */}
      <div className="space-y-14">
        <Reveal step={0}>
          <FilterBar
            filters={filters}
            fields={FILTER_FIELDS}
            options={options.data}
            onFilterChange={setFilter}
            onDateChange={setDateRange}
            onClear={clearChoices}
          />
          {/* Notes about the period (e.g. why it stops a day early) sit right under the dates */}
          <NoteList notes={kpis.data?.notes} className="mt-2.5 px-1" />
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
