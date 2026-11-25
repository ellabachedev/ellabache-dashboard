import ChangeChip from './ChangeChip.jsx'

// One KPI cell for a flat grid: label, large value, change vs last year.
// Place several inside <KpiGrid> so hairlines separate them (no card shadows).
export default function KpiCard({ label, kpi, format, icon: Icon }) {
  return (
    // group: on hover the cell tints and its icon picks up the accent colour.
    <div className="theme-fade group min-w-0 bg-card p-4 hover:bg-raised/50 sm:p-5">
      {/* Label row reserves two lines so values line up even when a label wraps */}
      <div className="flex min-h-10 items-start justify-between gap-2">
        <p className="text-sm font-medium leading-5 text-body">{label}</p>
        {Icon && (
          <Icon
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-subtle transition-all duration-200 group-hover:text-accent-ink motion-safe:group-hover:scale-110"
          />
        )}
      </div>
      {/* Proportional digits for big standalone numbers */}
      <p className="mt-1 text-2xl font-bold leading-tight tracking-[-0.03em] text-heading sm:text-[1.875rem]">
        {format(kpi.value)}
      </p>
      <div className="mt-2">
        <ChangeChip change={kpi.change} previousText={format(kpi.previous)} />
      </div>
    </div>
  )
}

// Flat grid of KPI cells separated by 1px hairlines (the gap shows the border colour).
export function KpiGrid({ children, className = '' }) {
  return (
    <div className={`theme-fade grid gap-px overflow-hidden rounded-card border border-line bg-line ${className}`}>
      {children}
    </div>
  )
}
