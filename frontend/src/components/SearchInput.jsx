import { Search, X } from 'lucide-react'

// Compact search box with a clear (×) button.
export default function SearchInput({ value, onChange, placeholder = 'Search…', label }) {
  return (
    <label className="relative flex h-8 w-full items-center sm:w-64">
      <span className="sr-only">{label ?? placeholder}</span>
      <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 text-subtle" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="field h-full w-full pl-9 pr-8 text-sm placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 flex h-5 w-5 items-center justify-center rounded text-body hover:text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
    </label>
  )
}
