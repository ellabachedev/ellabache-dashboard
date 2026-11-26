import { SearchX } from 'lucide-react'
import Button from './Button.jsx'

// Loading, empty and error placeholders used by every panel.

export function LoadingBlock({ height = 'h-32' }) {
  return (
    <div className={`${height} animate-pulse rounded-card bg-raised`} role="status">
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export function EmptyBlock({ message = 'No data for these filters.' }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-raised text-subtle">
        <SearchX size={20} aria-hidden="true" />
      </span>
      <p className="text-sm text-body">{message}</p>
    </div>
  )
}

export function ErrorBlock({ error, onRetry }) {
  return (
    <div role="alert" className="rounded-xl border border-danger/40 bg-danger-subtle p-4 text-sm text-danger-ink">
      <p>{error?.message || 'Something went wrong loading this data.'}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry} className="mt-3">
          Try again
        </Button>
      )}
    </div>
  )
}
