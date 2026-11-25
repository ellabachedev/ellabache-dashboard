import { TriangleAlert } from 'lucide-react'
import { formatDateTime } from '../utils/format.js'

// "Data updated …" label; warns when the backend served an older cached copy.
export default function DataUpdated({ status }) {
  if (!status) return null
  if (status.stale) {
    return (
      <p className="flex items-center gap-2 rounded bg-warning-subtle px-3 py-1.5 text-xs text-warning-ink">
        <TriangleAlert size={14} aria-hidden="true" />
        May be out of date (data source unavailable) · {formatDateTime(status.fetched_at)}
      </p>
    )
  }
  return (
    <p className="hidden items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs text-body sm:flex">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-success" />
      Updated {formatDateTime(status.fetched_at)}
    </p>
  )
}
