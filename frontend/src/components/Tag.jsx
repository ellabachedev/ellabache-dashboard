// A fact about a chart or section (period, scope, data source) as an icon + short text.
// Minimal by default: quiet text, no box. tone 'accent' = a soft pill for the one fact that matters
// most (the page's period).
export default function Tag({ icon: Icon, tone = 'neutral', children }) {
  const look =
    tone === 'accent'
      ? 'h-6 rounded-full bg-accent-subtle px-2.5 font-medium text-accent-ink'
      : 'text-subtle'
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs ${look}`}>
      {Icon && <Icon size={12} strokeWidth={2.25} aria-hidden="true" className="shrink-0 opacity-80" />}
      {children}
    </span>
  )
}

// A row of tags. tags: [{ label, icon, tone }].
export function TagList({ tags, className = '' }) {
  if (!tags?.length) return null
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 ${className}`}>
      {tags.map((tag) => (
        <Tag key={tag.label} icon={tag.icon} tone={tag.tone}>
          {tag.label}
        </Tag>
      ))}
    </div>
  )
}
