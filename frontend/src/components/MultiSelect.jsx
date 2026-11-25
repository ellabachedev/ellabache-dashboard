import { Check, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// Filter "chip": a small pill that opens a checkbox list. No selection means "all".
// Empty: dashed "+ State". Active: filled "State: NSW +1" with an × to clear.
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
      <div
        className={`flex h-8 items-center rounded-full text-sm transition-all duration-150 motion-safe:hover:-translate-y-px ${
          active
            ? 'bg-accent-subtle text-accent-ink ring-1 ring-accent/30 hover:ring-accent/60'
            : 'border border-dashed border-subtle text-body hover:border-solid hover:border-heading hover:bg-card hover:text-heading'
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={`${label}: ${summary ?? 'all'}`}
          className="flex h-full items-center gap-1.5 rounded-full pl-3 pr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {!active && <Plus size={14} aria-hidden="true" />}
          <span className={active ? 'font-medium' : ''}>{label}</span>
          {active && (
            <>
              <span aria-hidden="true" className="h-3.5 w-px bg-current opacity-30" />
              <span className="max-w-36 truncate font-semibold">{summary}</span>
            </>
          )}
        </button>
        {active && (
          <button
            type="button"
            onClick={() => onChange([])}
            aria-label={`Clear ${label}`}
            className="-ml-1.5 mr-1 flex h-6 w-6 items-center justify-center rounded-full hover:bg-accent/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 z-40 mt-2 w-72 overflow-hidden rounded-xl border border-line bg-card shadow-xl">
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
                className="mt-2 h-8 w-full rounded-md bg-raised px-2.5 text-sm text-heading placeholder:text-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
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
                        checked ? 'border-accent bg-accent text-white' : 'border-subtle'
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
