import { useMemo } from 'react'
import BarList from '../../components/BarList.jsx'
import ChartCard from '../../components/ChartCard.jsx'
import SectionTitle from '../../components/SectionTitle.jsx'
import { formatCount, formatDateRange, formatMoney } from '../../utils/format.js'
import { useProductGiftCards } from './useProductsQueries.js'

// Three headline figures above the list.
function Totals({ data }) {
  const items = [
    { label: 'Gift card revenue', value: formatMoney(data.total_revenue) },
    { label: 'Orders', value: formatCount(data.total_orders) },
    { label: 'Cards sold', value: formatCount(data.total_quantity) },
  ]
  return (
    <dl className="grid grid-cols-3 gap-px self-start overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-1">
      {items.map((item) => (
        <div key={item.label} className="bg-card px-4 py-3">
          <dt className="text-xs text-body">{item.label}</dt>
          <dd className="mt-1 text-xl font-bold tracking-tight text-heading">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

// Shopify gift card sales per value ($50 … $500). Aggregates only: no customer details.
export default function GiftCardsSection({ filters }) {
  const query = useProductGiftCards(filters)
  const bars = useMemo(
    () => (query.data?.rows ?? []).map((row) => ({ label: row.item_name ?? '(No name)', value: row.revenue })),
    [query.data],
  )
  const period = formatDateRange(filters.start_date, filters.end_date)

  return (
    <section>
      <SectionTitle
        title="Gift cards sold online"
        note="Shopify gift card orders by value · totals only (no customer details) · BigQuery"
      />
      <ChartCard
        title="Revenue by gift card value"
        subtitle={`Shopify online store · ${period}`}
        query={query}
        isEmpty={(data) => data.rows.length === 0}
        emptyMessage="No online gift card sales for these filters."
      >
        {(data) => (
          // Totals on the left and the list on the right on wide screens; stacked on phones.
          <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <Totals data={data} />
            <BarList bars={bars} format={formatMoney} valueLabel="Revenue" />
          </div>
        )}
      </ChartCard>
    </section>
  )
}
