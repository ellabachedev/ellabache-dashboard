import { CalendarDays, ShieldCheck, ShoppingCart } from 'lucide-react'
import { lazy, Suspense } from 'react'
import ChartCard from '../../components/ChartCard.jsx'
import SectionTitle from '../../components/SectionTitle.jsx'
import { LoadingBlock } from '../../components/StateViews.jsx'
import { formatCount, formatDateRange, formatMoney } from '../../utils/format.js'
import { SOURCE_TAG } from './pageConfig.js'
import { useProductGiftCards } from './useProductsQueries.js'

// lazy: the chart library is large, so it downloads separately, after the rest of the page shows.
const GiftCardValueChart = lazy(() => import('./GiftCardValueChart.jsx'))

// Three headline figures beside the chart.
function Totals({ data }) {
  const items = [
    { label: 'Gift card revenue', value: formatMoney(data.total_revenue) },
    { label: 'Orders', value: formatCount(data.total_orders) },
    { label: 'Cards sold', value: formatCount(data.total_quantity) },
  ]
  return (
    <dl className="grid grid-cols-3 gap-px self-start overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-1">
      {items.map((item) => (
        <div key={item.label} className="bg-card px-4 py-3.5">
          <dt className="text-xs text-body">{item.label}</dt>
          <dd className="font-display mt-1 text-lg font-bold tracking-tight text-heading sm:text-xl">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

// Shopify gift card sales per value ($50 … $500). Aggregates only: no customer details.
export default function GiftCardsSection({ filters }) {
  const query = useProductGiftCards(filters)
  const period = formatDateRange(filters.start_date, filters.end_date)

  return (
    <section>
      <SectionTitle
        title="Gift cards sold online"
        tags={[
          { label: 'Shopify online store', icon: ShoppingCart },
          { label: 'Totals only, no customer details', icon: ShieldCheck },
          SOURCE_TAG,
        ]}
      />
      <ChartCard
        title="Revenue by gift card value"
        tags={[{ label: period, icon: CalendarDays }]}
        query={query}
        isEmpty={(data) => data.rows.length === 0}
        emptyMessage="No online gift card sales for these filters."
      >
        {(data) => (
          // Totals on the left and the chart on the right on wide screens; stacked on phones.
          <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
            <Totals data={data} />
            <Suspense fallback={<LoadingBlock height="h-64" />}>
              <GiftCardValueChart rows={data.rows} />
            </Suspense>
          </div>
        )}
      </ChartCard>
    </section>
  )
}
