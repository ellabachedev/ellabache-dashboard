import { RefreshCw } from 'lucide-react'
import { formatDateTime } from '../utils/format.js'

// "Updated …" as a quiet tag for the title's tag row (CLAUDE.md: show when data was fetched).
// Hidden when the data is stale: the StaleWarning shows instead.
export function updatedTag(status) {
  if (!status || status.stale) return null
  return { label: `Updated ${formatDateTime(status.fetched_at)}`, icon: RefreshCw }
}
