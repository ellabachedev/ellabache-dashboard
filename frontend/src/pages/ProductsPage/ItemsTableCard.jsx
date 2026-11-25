import { useState } from 'react'
import ChartCard from '../../components/ChartCard.jsx'
import DataTable from '../../components/DataTable.jsx'
import SearchInput from '../../components/SearchInput.jsx'
import SectionTitle from '../../components/SectionTitle.jsx'
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js'
import { formatCount, formatDateRange } from '../../utils/format.js'
import { ITEMS_PAGE_SIZE } from './pageConfig.js'
import { useProductItems } from './useProductsQueries.js'

const money = (value) =>
  value.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', currencyDisplay: 'narrowSymbol' })

const COLUMNS = [
  { key: 'item_name', label: 'Item name', sortable: true },
  { key: 'revenue', label: 'Total revenue', numeric: true, format: money, bar: true, sortable: true },
  { key: 'orders', label: 'Total orders', numeric: true, format: formatCount, sortable: true },
  { key: 'quantity', label: 'Total quantity', numeric: true, format: formatCount, sortable: true },
]

export default function ItemsTableCard({ filters }) {
  const [offset, setOffset] = useState(0)
  const [sort, setSort] = useState({ by: 'revenue', dir: 'desc' })
  const [searchText, setSearchText] = useState('')
  const search = useDebouncedValue(searchText.trim())

  // Go back to page 1 whenever the filters, sort or search change
  // (React's "reset state when inputs change" pattern).
  const inputs = `${JSON.stringify(filters)}|${sort.by}|${sort.dir}|${search}`
  const [inputsSeen, setInputsSeen] = useState(inputs)
  if (inputsSeen !== inputs) {
    setInputsSeen(inputs)
    setOffset(0)
  }

  const query = useProductItems(filters, {
    limit: ITEMS_PAGE_SIZE,
    offset,
    sortBy: sort.by,
    sortDir: sort.dir,
    search,
  })
  const period = formatDateRange(filters.start_date, filters.end_date)

  return (
    <section>
      <SectionTitle title="Product performance" note="Every product line ranked · sort any column or search by name" />
      <ChartCard
        title="Revenue by item"
        subtitle={`All product lines · ${period}`}
        query={query}
        isEmpty={(data) => data.total_rows === 0}
        emptyMessage={search ? `No items match “${search}”.` : 'No items for these filters.'}
        actions={<SearchInput value={searchText} onChange={setSearchText} placeholder="Search items…" />}
        flush
      >
        {(data) => (
          <DataTable
            columns={COLUMNS}
            rows={data.rows}
            showRank={sort.by === 'revenue' && sort.dir === 'desc' && !search}
            rowKey={(row, index) => `${row.item_name}-${index}`}
            sort={{ by: sort.by, dir: sort.dir, onChange: (by, dir) => setSort({ by, dir }) }}
            paging={{ offset, limit: ITEMS_PAGE_SIZE, total: data.total_rows, onChange: setOffset }}
          />
        )}
      </ChartCard>
    </section>
  )
}
