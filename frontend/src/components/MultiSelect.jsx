import { Check, ChevronDown, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// Filter pill (Shopify Polaris style) that opens a checkbox list. No selection means "all".
// Empty: dashed "+ State". Active: solid "State: NSW +1" with an × to clear.
export default function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const boxRef = useRef(null)

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return undefined
    const close = (event) => {
      if (event.key === 'Escape' || (event.type === 'mousedown' && !boxRef.current?.contains(event.target))) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  const toggle = (option) =>
    onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option])

  const active = selected.length > 0
  const visible = options.filter((option) => option.toLowerCase().includes(search.toLowerCase()))
  const summary = active ? `${selected[0]}${selected.length > 1 ? ` +${selected.length - 1}` : ''}` : null

  return (
    <div ref={boxRef} className="relative">
      {/* Polaris filter pill: dashed when empty, solid border when a filter is on */}
      <div className={`pill ${active ? 'is-active' : ''}`}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={`${label}: ${summary ?? 'all'}`}
          className="flex h-6 items-center gap-1 rounded-lg px-2 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent"
        >
          {!active && <Plus size={13} aria-hidden="true" className="text-subtle" />}
          <span>{label}</span>
          {active && <span className="max-w-36 truncate font-semibold">: {summary}</span>}
          <ChevronDown size={13} aria-hidden="true" className="text-subtle" />
        </button>
        {active && (
          <button
            type="button"
            onClick={() => onChange([])}
            aria-label={`Clear ${label}`}
            className="mr-1 flex h-5 w-5 items-center justify-center rounded-md text-subtle hover:bg-[var(--eb-btn-tertiary-hover)] hover:text-heading focus:outline-none focus-visible:outline-2 focus-visible:outline-accent"
          >
            <X size={12} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 z-40 mt-1.5 w-72 overflow-hidden rounded-xl border border-line bg-card shadow-card-hover">
          <div className="border-b border-line px-3 py-2.5">
            <p className="text-xs font-semibold text-heading">{label}</p>
            {options.length > 8 && (
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${label.toLowerCase()}…`}
                aria-label={`Search ${label}`}
                autoFocus
                className="field mt-2 h-8 w-full px-2.5 text-sm placeholder:text-subtle"
              />
            )}
          </div>
          <ul className="max-h-64 overflow-y-auto p-1.5">
            {visible.map((option) => {
              const checked = selected.includes(option)
              return (
                <li key={option}>
                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={checked}
                    onClick={() => toggle(option)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-heading hover:bg-raised focus:outline-none focus-visible:bg-raised"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        checked ? 'border-accent bg-accent text-white' : 'border-[var(--eb-input-border)]'
                      }`}
                    >
                      {checked && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="truncate">{option}</span>
                  </button>
                </li>
              )
            })}
            {visible.length === 0 && <li className="px-2 py-2 text-sm text-body">No matches</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
