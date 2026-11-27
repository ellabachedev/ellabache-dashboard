import HeroMetric from '../../components/HeroMetric.jsx'
import KpiCard, { KpiGrid } from '../../components/KpiCard.jsx'
import SectionTitle from '../../components/SectionTitle.jsx'
import { ErrorBlock, LoadingBlock } from '../../components/StateViews.jsx'
import { formatChange, formatMoney } from '../../utils/format.js'
import { METRIC_HELP } from './metricHelp.js'
import { KPI_SECTIONS } from './pageConfig.js'

// Hero block (headline revenue) on the left, a hairline grid of six figures on the right.
function KpiSection({ config, data }) {
  const hero = data[config.hero.key]
  const aov = data.aov
  const help = METRIC_HELP[config.id]
  // Last year's revenue is already in the chip and the bars, so only AOV is added here.
  const extras = [
    {
      label: config.aovLabel,
      help: help.aov,
      value: formatMoney(aov.value),
      note: aov.change === null ? null : `${formatChange(aov.change)} vs last year`,
    },
  ]

  return (
    <section>
      <SectionTitle title={config.title} note={config.note} tags={config.tags} />
      {/* Hero beside the grid only on wide screens (the sidebar takes 240px); stacked below that. */}
      <div className="grid gap-4 xl:grid-cols-12">
        <HeroMetric
          className="xl:col-span-4"
          label={config.hero.label}
          help={help[config.hero.key]}
          kpi={hero}
          format={formatMoney}
          variant={config.variant}
          extras={extras}
        />
        <KpiGrid className="grid-cols-2 md:grid-cols-3 xl:col-span-8">
          {config.cells.map((cell) => (
            <KpiCard
              key={cell.key}
              label={cell.label}
              help={help[cell.key]}
              kpi={data[cell.key]}
              format={cell.format}
              icon={cell.icon}
            />
          ))}
        </KpiGrid>
      </div>
    </section>
  )
}

export default function KpiSections({ query }) {
  if (query.isPending) {
    return (
      <div className="grid gap-4 xl:grid-cols-12">
        <LoadingBlock height="h-72 xl:col-span-4" />
        <LoadingBlock height="h-72 xl:col-span-8" />
      </div>
    )
  }
  if (query.isError) return <ErrorBlock error={query.error} onRetry={query.refetch} />

  // While new numbers load, keep the old ones visible but dimmed (no flashing).
  const refreshing = query.isFetching
  return (
    <div className={`theme-fade space-y-14 ${refreshing ? 'opacity-50' : ''}`} aria-busy={refreshing}>
      {KPI_SECTIONS.map((config) => (
        <KpiSection key={config.id} config={config} data={query.data[config.id]} />
      ))}
    </div>
  )
}
