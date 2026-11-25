import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button.jsx'

const maxOf = (rows, key) => Math.max(...rows.map((row) => row[key] ?? 0), 0)

// Number with a slim bar beside it, scaled to the largest value on this page (display only).
function BarCell({ value, max, text }) {
  const width = max > 0 ? Math.max(2, (value / max) * 100) : 0
  return (
    <span className="flex items-center justify-end gap-3">
      <span aria-hidden="true" className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-raised xl:block">
        <span className="bar-grow block h-full rounded-full bg-accent" style={{ width: `${width}%` }} />
      </span>
      <span>{text}</span>
    </span>
  )
}

// Rank badge: the top three stand out in the accent colour.
function Rank({ n }) {
  const top = n <= 3
  return (
    <span
      className={`tabular inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-semibold ${
        top ? 'bg-accent-subtle text-accent-ink' : 'text-body'
      }`}
    >
      {n}
    </span>
  )
}

// Column header; when `sort` is given and the column is sortable, it becomes a button that
// toggles the sort (numbers start high-to-low, names A–Z).
function HeaderCell({ col, sort }) {
  const align = col.numeric ? 'text-right' : ''
  const base = `px-4 py-2.5 font-medium xl:px-6 ${align}`
  if (!sort || !col.sortable) {
    return (
      <th scope="col" className={base}>
        {col.label}
      </th>
    )
  }
  const active = sort.by === col.key
  const Arrow = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown
  const nextDir = active ? (sort.dir === 'asc' ? 'desc' : 'asc') : col.numeric ? 'desc' : 'asc'
  return (
    <th scope="col" className={base} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        onClick={() => sort.onChange(col.key, nextDir)}
        className={`inline-flex items-center gap-1 rounded hover:text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          active ? 'text-heading' : ''
        } ${col.numeric ? 'flex-row-reverse' : ''}`}
      >
        {col.label}
        <Arrow size={13} aria-hidden="true" className={active ? 'text-accent-ink' : 'text-subtle'} />
      </button>
    </th>
  )
}

// Table with numeric columns right-aligned, plus Previous / Next paging.
// columns: [{ key, label, numeric, format, bar, sortable }]; paging: { offset, limit, total, onChange }.
// sort (optional): { by, dir, onChange(key, dir) } makes `sortable` column headers clickable.
// bar: true adds a slim in-cell bar so rows can be compared at a glance.
// showRank adds a rank badge counting from the first row of the current page.
export default function DataTable({ columns, rows, rowKey, paging, sort, showRank = false }) {
  const { offset, limit, total, onChange } = paging
  const from = total === 0 ? 0 : offset + 1
  const to = Math.min(offset + limit, total)

  return (
    <div>
      {/* On narrow screens the table scrolls sideways inside its panel instead of wrapping names */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] whitespace-nowrap text-sm">
          <thead>
            <tr className="bg-raised text-left text-xs font-medium text-body">
              {showRank && (
                <th scope="col" className="w-14 py-2.5 pl-6 pr-2 font-medium">
                  Rank
                </th>
              )}
              {columns.map((col) => (
                <HeaderCell key={col.key} col={col} sort={sort} />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row, index) => (
              <tr key={rowKey(row, index)} className="transition-colors hover:bg-raised/60">
                {showRank && (
                  <td className="py-3 pl-6 pr-2">
                    <Rank n={offset + index + 1} />
                  </td>
                )}
                {columns.map((col, colIndex) => {
                  const text = col.format ? col.format(row[col.key]) : (row[col.key] ?? '—')
                  const first = colIndex === 0 && !col.numeric
                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-3 xl:px-6 ${col.numeric ? 'tabular text-right text-heading' : ''} ${
                        first ? 'font-medium text-heading' : ''
                      }`}
                    >
                      {col.bar ? <BarCell value={row[col.key]} max={maxOf(rows, col.key)} text={text} /> : text}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-3 text-sm text-body">
        <span className="tabular">
          <span className="font-medium text-heading">
            {from}–{to}
          </span>{' '}
          of {total.toLocaleString('en-AU')} items
        </span>
        <div className="flex gap-2">
          <Button size="sm" disabled={offset === 0} onClick={() => onChange(Math.max(0, offset - limit))}>
            <ChevronLeft size={14} aria-hidden="true" /> Previous
          </Button>
          <Button size="sm" disabled={to >= total} onClick={() => onChange(offset + limit)}>
            Next <ChevronRight size={14} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  )
}
