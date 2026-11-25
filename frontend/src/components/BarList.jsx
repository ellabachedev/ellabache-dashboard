import { formatPercent } from '../utils/format.js'

// Ranked list where each row's background bar shows its size, starting at zero.
// Crisp HTML (not a canvas chart): text stays sharp, selectable and readable by screen readers.
// bars: [{ label, value, share, muted }]. `muted` rows ("Others", unknown) use a grey bar.
export default function BarList({ bars, format, valueLabel = 'Value' }) {
  const max = Math.max(...bars.map((bar) => bar.value ?? 0), 0)
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-medium text-body">
        <span>Name</span>
        <span>{valueLabel}</span>
      </div>
      <ul className="space-y-1.5">
        {bars.map((bar) => {
          const width = max > 0 ? Math.max(2, (bar.value / max) * 100) : 0
          return (
            // group: hovering a row deepens its bar so the eye can follow it to the value.
            <li key={bar.label} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="relative h-8 overflow-hidden rounded-md transition-colors group-hover:bg-raised/60">
                <div
                  aria-hidden="true"
                  className={`bar-grow absolute inset-y-0 left-0 rounded-md transition-colors duration-150 ${
                    bar.muted ? 'bg-raised group-hover:bg-line' : 'bg-accent/15 group-hover:bg-accent/30'
                  }`}
                  style={{ width: `${width}%` }}
                />
                <span
                  className={`relative flex h-full items-center truncate px-2.5 text-sm ${
                    bar.muted ? 'text-body' : 'text-heading'
                  }`}
                >
                  {bar.label}
                </span>
              </div>
              <span className="flex items-baseline gap-2 text-right">
                <span className="tabular text-sm font-semibold text-heading">{format(bar.value)}</span>
                {bar.share !== null && bar.share !== undefined && (
                  <span className="tabular w-10 text-xs text-body">{formatPercent(bar.share, 0)}</span>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
