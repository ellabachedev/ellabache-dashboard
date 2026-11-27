import ChangeChip from './ChangeChip.jsx'
import InfoLabel from './InfoLabel.jsx'

// Look of each hero block. Gradient fills come from theme tokens (tokens.css).
const VARIANTS = {
  total: 'bg-hero-total text-hero-total-ink',
  product: 'bg-hero-product text-hero-product-ink',
}

// Two bars comparing this period with the same dates last year (bar length only, no maths
// beyond scaling to the larger of the two).
function YearBars({ kpi, format }) {
  if (kpi.value === null || kpi.previous === null) return null
  const max = Math.max(kpi.value, kpi.previous) || 1
  const rows = [
    { label: 'This year', value: kpi.value, strong: true },
    { label: 'Last year', value: kpi.previous, strong: false },
  ]
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 text-xs">
          <span className="opacity-80">{row.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-white/15">
            <span
              className={`bar-grow block h-full rounded-full bg-white ${row.strong ? '' : 'opacity-45'}`}
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </span>
          <span className="tabular w-16 text-right font-semibold">{format(row.value)}</span>
        </div>
      ))}
    </div>
  )
}

// The headline number of a section on a navy block: big value, change vs last year,
// this-year/last-year bars and supporting figures. extras: [{ label, value, note, help }] (formatted text).
// `help` (optional): plain explanation shown when a label is hovered or tapped.
// Narrow column (wide screens): everything stacks. Full width (mid screens): two halves side by side.
export default function HeroMetric({ label, help, kpi, format, variant = 'total', extras = [], className = '' }) {
  return (
    <div
      className={`theme-fade hover-lift grid gap-8 rounded-card p-6 shadow-card md:grid-cols-2 md:gap-12 md:p-7 xl:flex xl:flex-col xl:justify-between xl:gap-8 ${VARIANTS[variant]} ${className}`}
    >
      <div>
        <p className="text-sm font-semibold opacity-90">
          <InfoLabel label={label} help={help} />
        </p>
        {/* Proportional digits for big standalone numbers */}
        <p className="font-display mt-5 text-[2.75rem] font-extrabold leading-none tracking-[-0.04em] sm:text-[3.5rem]">
          {format(kpi.value)}
        </p>
        <div className="mt-4">
          <ChangeChip change={kpi.change} previousText={format(kpi.previous)} onHero />
        </div>
      </div>

      <div className="flex flex-col justify-end gap-6">
        <YearBars kpi={kpi} format={format} />
        {extras.length > 0 && (
          <dl className="flex flex-wrap gap-3">
            {extras.map((extra) => (
              <div key={extra.label} className="min-w-0 flex-1 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
                <dt className="text-xs opacity-80">
                  <InfoLabel label={extra.label} help={extra.help} />
                </dt>
                <dd className="mt-1 flex flex-wrap items-baseline gap-x-2">
                  <span className="font-display text-xl font-bold tracking-tight">{extra.value}</span>
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
