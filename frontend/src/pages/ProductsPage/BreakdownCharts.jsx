import { useMemo } from 'react'
import BarList from '../../components/BarList.jsx'
import ChartCard from '../../components/ChartCard.jsx'
import SectionTitle from '../../components/SectionTitle.jsx'
import { formatDateRange, formatMoney } from '../../utils/format.js'
import { BREAKDOWNS } from './pageConfig.js'
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
      subtitle={`${period} · top 10 · grey = others`}
      query={query}
      isEmpty={(data) => data.bars.length === 0}
    >
      {() => <BarList bars={bars} format={formatMoney} valueLabel="Revenue · share" />}
    </ChartCard>
  )
}

export default function BreakdownCharts({ filters }) {
  return (
    <section>
      <SectionTitle title="Where product revenue comes from" note="Top 10 by category, state and salon · BigQuery" />
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
