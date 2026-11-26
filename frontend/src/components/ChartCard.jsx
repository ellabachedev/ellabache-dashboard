import { EmptyBlock, ErrorBlock, LoadingBlock } from './StateViews.jsx'
import { TagList } from './Tag.jsx'

// Panel with a header (title, meta tags) that shows loading / error / empty states.
// `query` is a TanStack Query result; `isEmpty(data)` decides when to show `emptyMessage`.
// `tags`: [{ label, icon, tone }] shown as pills under the title (period, scope, source).
// `actions` sits on the right of the header (e.g. a search box).
// `flush` lets content (e.g. a table) run edge to edge under the header.
// While new data loads, the old content stays visible at reduced opacity (no flashing).
export default function ChartCard({
  title,
  subtitle,
  tags,
  query,
  isEmpty,
  emptyMessage,
  actions,
  flush = false,
  children,
}) {
  const empty = !query.isPending && !query.isError && isEmpty?.(query.data)
  let body
  if (query.isPending) body = <LoadingBlock height="h-64" />
  else if (query.isError) body = <ErrorBlock error={query.error} onRetry={query.refetch} />
  else if (empty) body = <EmptyBlock message={emptyMessage} />
  else body = children(query.data)

  const refreshing = query.isFetching && !query.isPending
  const padded = !flush || query.isPending || query.isError || empty

  return (
    <section className="theme-fade card-surface flex h-full flex-col overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
        <div className="min-w-0">
          <div>
            <h3 className="font-display text-base font-bold tracking-[-0.01em] text-heading">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-subtle">{subtitle}</p>}
            <TagList tags={tags} className="mt-2" />
          </div>
        </div>
        {actions}
      </header>
      <div
        className={`theme-fade flex-1 ${padded ? 'px-5 pb-6 sm:px-6' : ''} ${refreshing ? 'opacity-50' : ''}`}
        aria-busy={refreshing}
      >
        {body}
      </div>
    </section>
  )
}
