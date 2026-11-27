import ChangeChip from './ChangeChip.jsx'
import InfoLabel from './InfoLabel.jsx'

// One KPI card: label (with a small icon), large value, then the change chip and last year's value.
// `help` (optional): plain explanation shown when the label is hovered or tapped.
export default function KpiCard({ label, help, kpi, format, icon: Icon }) {
  return (
    <div className="theme-fade card-surface card-hover group min-w-0 p-4 sm:p-5">
      {/* Label reserves two lines so values line up even when a label wraps */}
      <p className="flex min-h-10 items-start gap-2 text-sm font-medium leading-5 text-body">
        {Icon && <Icon size={15} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-subtle" />}
        <InfoLabel label={label} help={help} />
      </p>
      {/* Proportional digits for big standalone numbers */}
      <p className="font-display mt-1 text-2xl font-bold leading-tight tracking-[-0.03em] text-heading sm:text-[1.75rem]">
        {format(kpi.value)}
      </p>
      <div className="mt-2.5">
        <ChangeChip change={kpi.change} previousText={format(kpi.previous)} />
      </div>
    </div>
  )
}

// Grid of KPI cards with even gaps.
export function KpiGrid({ children, className = '' }) {
  return <div className={`grid gap-4 ${className}`}>{children}</div>
}
