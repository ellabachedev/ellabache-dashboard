import { CalendarDays, ListOrdered } from 'lucide-react'
import { useMemo } from 'react'
import BarList from '../../components/BarList.jsx'
import ChartCard from '../../components/ChartCard.jsx'
import SectionTitle from '../../components/SectionTitle.jsx'
import { formatDateRange, formatMoney } from '../../utils/format.js'
import { BREAKDOWNS, SOURCE_TAG } from './pageConfig.js'
import { useProductsBreakdown } from './useProductsQueries.js'

// "Others" and "(No …)" / "(Unknown …)" buckets are not real categories: shown in grey.
const isBucket = (label) => label === 'Others' || label.startsWith('(')

function BreakdownPanel({ filters, by, title }) {
  const query = useProductsBreakdown(filters, by)
  // useMemo: only rebuild the rows when new data arrives.
  const bars = useMemo(
    () =>
      (query.data?.bars ?? []).map((bar) => ({
        label: bar.label,
        value: bar.revenue,
        share: bar.share,
        muted: isBucket(bar.label),
      })),
    [query.data],
  )
  const period = formatDateRange(filters.start_date, filters.end_date)

  return (
    <ChartCard
      title={title}
      tags={[
        { label: period, icon: CalendarDays },
        { label: 'Top 10', icon: ListOrdered },
      ]}
      query={query}
      isEmpty={(data) => data.bars.length === 0}
    >
      {(data) => (
        // Column layout so the total line sits at the bottom, even when the list is short.
        <div className="flex h-full flex-col">
          <BarList bars={bars} format={formatMoney} valueLabel="Revenue · share" />
          <div className="mt-auto pt-5">
            <div className="flex items-baseline justify-between border-t border-line pt-3 text-sm">
              <span className="text-body">Total product revenue</span>
              <span className="tabular font-semibold text-heading">{formatMoney(data.total_revenue)}</span>
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  )
}

export default function BreakdownCharts({ filters }) {
  return (
    <section>
      <SectionTitle
        title="Where product revenue comes from"
        note="The biggest categories, states and salons. Grey bars group everything else."
        tags={[SOURCE_TAG]}
      />
      {/* 1 column on phones, 2 on mid widths (last panel spans both), 3 on wide screens */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {BREAKDOWNS.map((chart, index) => (
          <div key={chart.by} className={index === BREAKDOWNS.length - 1 ? 'md:col-span-2 xl:col-span-1' : ''}>
            <BreakdownPanel filters={filters} by={chart.by} title={chart.title} />
          </div>
        ))}
      </div>
    </section>
  )
}
