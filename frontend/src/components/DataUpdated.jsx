import { TriangleAlert } from 'lucide-react'
import { formatDateTime } from '../utils/format.js'

// Warning shown only when the backend served an older cached copy (data source unavailable).
export default function StaleWarning({ status, className = '' }) {
  if (!status?.stale) return null
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full bg-warning-subtle px-3 py-1.5 text-xs text-warning-ink ${className}`}
    >
      <TriangleAlert size={14} aria-hidden="true" />
      May be out of date (data source unavailable) · {formatDateTime(status.fetched_at)}
    </p>
  )
}
