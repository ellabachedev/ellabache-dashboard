import { CalendarDays, SlidersHorizontal } from 'lucide-react'
import { datePresets } from '../utils/dates.js'
import Button from './Button.jsx'
import MultiSelect from './MultiSelect.jsx'

// Segmented control for quick periods: a soft track with the active option raised on top.
function PeriodSwitch({ filters, onDateChange }) {
  return (
    <div role="group" aria-label="Quick date range" className="grid grid-cols-2 gap-1 rounded-lg bg-raised p-1 sm:flex sm:gap-0">
      {datePresets().map((preset) => {
        const active = preset.start === filters.start_date && preset.end === filters.end_date
        return (
          <button
            key={preset.id}
            type="button"
            aria-pressed={active}
            onClick={() => onDateChange(preset.start, preset.end)}
            // Active option looks like a raised secondary button sitting on the track.
            className={`h-7 whitespace-nowrap rounded-md px-3 text-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              active
                ? 'bg-[var(--eb-btn-secondary-bg)] font-semibold text-heading shadow-[var(--eb-btn-secondary-shadow)]'
                : 'text-body hover:bg-card/60 hover:text-heading'
            }`}
          >
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}

// Exact dates as one compact field: [calendar] from → to.
function DateRange({ filters, onDateChange }) {
  const dateInput =
    'h-7 min-w-0 flex-1 rounded bg-transparent px-1 text-sm text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:flex-none'
  return (
    <div className="flex h-9 w-full items-center gap-1 rounded-lg border border-line bg-card px-2.5 shadow-[var(--eb-input-shadow)] transition-colors focus-within:border-accent hover:border-subtle sm:w-auto">
      <CalendarDays size={15} aria-hidden="true" className="text-subtle" />
      <input
        type="date"
        aria-label="From date"
        value={filters.start_date}
        max={filters.end_date}
        onChange={(event) => onDateChange(event.target.value, filters.end_date)}
        className={dateInput}
      />
      <span aria-hidden="true" className="text-subtle">→</span>
      <input
        type="date"
        aria-label="To date"
        value={filters.end_date}
        min={filters.start_date}
        onChange={(event) => onDateChange(filters.start_date, event.target.value)}
        className={dateInput}
      />
    </div>
  )
}

// One toolbar above everything it controls: period, exact dates, then a chip per filter.
// fields: [{ name: 'state', label: 'State' }, ...]; options: { state: ['NSW', ...] }.
export default function FilterBar({ filters, fields, options, onFilterChange, onDateChange, onClear }) {
  const activeCount = fields.filter((field) => filters[field.name].length > 0).length

  return (
    <section aria-label="Filters" className="theme-fade rounded-card border border-line bg-card p-3">
      <div className="flex flex-wrap items-center gap-3">
        <PeriodSwitch filters={filters} onDateChange={onDateChange} />
        <DateRange filters={filters} onDateChange={onDateChange} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <span className="mr-1 flex items-center gap-1.5 text-xs font-medium text-body">
          <SlidersHorizontal size={14} aria-hidden="true" />
          Filters
        </span>
        {fields.map((field) => (
          <MultiSelect
            key={field.name}
            label={field.label}
            options={options?.[field.name] ?? []}
            selected={filters[field.name]}
            onChange={(value) => onFilterChange(field.name, value)}
          />
        ))}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto">
            Clear all
          </Button>
        )}
      </div>
    </section>
  )
}
