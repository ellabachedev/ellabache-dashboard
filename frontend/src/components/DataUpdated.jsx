import { TriangleAlert } from 'lucide-react'
import { formatDateTime } from '../utils/format.js'

// "Data updated …" label; warns when the backend served an older cached copy.
export default function DataUpdated({ status }) {
  if (!status) return null
  if (status.stale) {
    return (
      <p className="flex items-center gap-2 rounded-full bg-warning-subtle px-3 py-1.5 text-xs text-warning-ink">
        <TriangleAlert size={14} aria-hidden="true" />
        May be out of date (data source unavailable) · {formatDateTime(status.fetched_at)}
      </p>
    )
  }
  return (
    <p className="hidden items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-body shadow-card sm:flex">
      {/* Live dot with a soft pulse ring (the ring is off for reduced motion) */}
      <span aria-hidden="true" className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      Updated {formatDateTime(status.fetched_at)}
    </p>
  )
}
