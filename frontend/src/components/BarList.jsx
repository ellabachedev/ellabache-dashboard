import { formatPercent } from '../utils/format.js'

// Ranked list: each row is "label …… value  share" with a slim bar underneath, starting at zero.
// Crisp HTML (not a canvas chart): text stays sharp, selectable and readable by screen readers.
// bars: [{ label, value, share, muted }]. `muted` rows ("Others", unknown) use a grey bar.
export default function BarList({ bars, format, valueLabel = 'Value' }) {
  const max = Math.max(...bars.map((bar) => bar.value ?? 0), 0)
  return (
    <div>
      <div className="mb-3 flex justify-between text-xs font-medium text-subtle">
        <span>Name</span>
        <span>{valueLabel}</span>
      </div>
      <ul className="space-y-3.5">
        {bars.map((bar) => {
          const width = max > 0 ? Math.max(1.5, (bar.value / max) * 100) : 0
          const hasShare = bar.share !== null && bar.share !== undefined
          return (
            // group: hovering a row darkens its bar so the eye can follow it to the value.
            <li key={bar.label} className="group" title={`${bar.label}: ${format(bar.value)}`}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className={`truncate ${bar.muted ? 'text-body' : 'font-medium text-heading'}`}>{bar.label}</span>
                <span className="flex shrink-0 items-baseline gap-2">
                  <span className="tabular font-semibold text-heading">{format(bar.value)}</span>
                  {hasShare && (
                    <span className="tabular w-9 text-right text-xs text-subtle">{formatPercent(bar.share, 0)}</span>
                  )}
                </span>
              </div>
              <div aria-hidden="true" className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-raised">
                <div
                  className={`bar-grow h-full rounded-full transition-colors duration-150 ${
                    bar.muted ? 'bg-chart-muted' : 'bg-accent-gradient group-hover:brightness-110'
                  }`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
