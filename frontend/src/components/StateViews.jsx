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
  return <p className="py-10 text-center text-sm text-body">{message}</p>
}

export function ErrorBlock({ error, onRetry }) {
  return (
    <div role="alert" className="rounded-card border border-danger/40 bg-danger-subtle p-4 text-sm text-danger-ink">
      <p>{error?.message || 'Something went wrong loading this data.'}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry} className="mt-3">
          Try again
        </Button>
      )}
    </div>
  )
}
