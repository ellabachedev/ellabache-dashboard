import ChangeChip from './ChangeChip.jsx'

// Look of each hero block. Fills come from theme tokens (black / blue in light mode).
const VARIANTS = {
  total: 'bg-hero-total text-hero-total-ink',
  product: 'bg-hero-product text-hero-product-ink',
}

// Two thin bars comparing this period with the same dates last year (bar length only, no maths
// beyond scaling to the larger of the two).
function YearBars({ kpi, format }) {
  if (kpi.value === null || kpi.previous === null) return null
  const max = Math.max(kpi.value, kpi.previous) || 1
  const rows = [
    { label: 'This year', value: kpi.value, strong: true },
    { label: 'Last year', value: kpi.previous, strong: false },
  ]
  return (
    <div className="space-y-2" aria-hidden="true">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 text-xs">
          <span className="opacity-80">{row.label}</span>
          <span className="h-1.5 overflow-hidden rounded-full bg-current/15">
            <span
              className={`bar-grow block h-full rounded-full bg-current ${row.strong ? '' : 'opacity-45'}`}
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </span>
          <span className="tabular w-16 text-right font-medium">{format(row.value)}</span>
        </div>
      ))}
    </div>
  )
}

// The headline number of a section on a solid colour block: big value, change vs last year,
// this-year/last-year bars and supporting figures. extras: [{ label, value, note }] (formatted text).
// Narrow column (wide screens): everything stacks. Full width (mid screens): two halves side by side.
export default function HeroMetric({ label, kpi, format, variant = 'total', extras = [], className = '' }) {
  return (
    <div
      className={`theme-fade hover-lift grid gap-8 rounded-card p-6 md:grid-cols-2 md:gap-12 md:p-7 xl:flex xl:flex-col xl:justify-between xl:gap-8 ${VARIANTS[variant]} ${className}`}
    >
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {/* Proportional digits for big standalone numbers */}
        <p className="mt-5 text-[2.75rem] font-bold leading-none tracking-[-0.04em] sm:text-[3.5rem]">
          {format(kpi.value)}
        </p>
        <div className="mt-4">
          <ChangeChip change={kpi.change} previousText={format(kpi.previous)} onHero />
        </div>
      </div>

      <div className="flex flex-col justify-end gap-6">
        <YearBars kpi={kpi} format={format} />
        {extras.length > 0 && (
          <dl className="flex flex-wrap gap-x-10 gap-y-4 border-t border-current/20 pt-4">
            {extras.map((extra) => (
              <div key={extra.label}>
                <dt className="text-xs opacity-80">{extra.label}</dt>
                <dd className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-semibold tracking-tight">{extra.value}</span>
                  {extra.note && <span className="text-xs opacity-80">{extra.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  )
}
