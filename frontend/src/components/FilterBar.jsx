import { CalendarDays } from 'lucide-react'
import { datePresets } from '../utils/dates.js'
import { formatDate } from '../utils/format.js'
import Button from './Button.jsx'
import MultiSelect from './MultiSelect.jsx'

// Quick periods as joined buttons (Polaris segmented ButtonGroup). The selected one looks pressed.
function PeriodSwitch({ filters, onDateChange }) {
  return (
    <div role="group" aria-label="Quick date range" className="btn-group btn-group-grid">
      {datePresets().map((preset) => {
        const active = preset.start === filters.start_date && preset.end === filters.end_date
        return (
          <button
            key={preset.id}
            type="button"
            aria-pressed={active}
            onClick={() => onDateChange(preset.start, preset.end)}
            className={`btn btn-secondary ${active ? 'is-pressed' : ''}`}
          >
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}

// Open the browser's calendar. Wrapped in try/catch: some browsers refuse outside a direct click.
function openPicker(input) {
  try {
    input.showPicker?.()
  } catch {
    // The browser opens its own picker instead (or the user can type the date).
  }
}

// One date as a button showing "1 Nov" or "25 Nov 2026". The real date input sits invisibly on
// top, so a click (or Enter / Space) opens the browser's calendar.
function DateField({ label, value, text, min, max, onChange, icon = false }) {
  return (
    <label className="btn btn-secondary focus-within:outline-2 focus-within:outline-accent">
      {icon && <CalendarDays size={14} aria-hidden="true" className="text-subtle" />}
      {text}
      <input
        type="date"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        // An emptied field is ignored, so the range always has both dates.
        onChange={(event) => event.target.value && onChange(event.target.value)}
        onClick={(event) => openPicker(event.currentTarget)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openPicker(event.currentTarget)
          }
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  )
}

// Exact dates as two joined buttons: [calendar 1 Nov | 25 Nov 2026].
// The year shows once when both dates are in the same year.
function DateRange({ filters, onDateChange }) {
  const sameYear = filters.start_date.slice(0, 4) === filters.end_date.slice(0, 4)
  const startText = sameYear ? formatDate(filters.start_date).replace(/ \d{4}$/, '') : formatDate(filters.start_date)
  return (
    <div role="group" aria-label="Date range" className="btn-group">
      <DateField
        icon
        label="From date"
        value={filters.start_date}
        text={startText}
        max={filters.end_date}
        onChange={(start) => onDateChange(start, filters.end_date)}
      />
      <DateField
        label="To date"
        value={filters.end_date}
        text={formatDate(filters.end_date)}
        min={filters.start_date}
        onChange={(end) => onDateChange(filters.start_date, end)}
      />
    </div>
  )
}

// One quiet toolbar above everything it controls: period + exact dates, then a pill per filter.
// fields: [{ name: 'state', label: 'State' }, ...]; options: { state: ['NSW', ...] }.
export default function FilterBar({ filters, fields, options, onFilterChange, onDateChange, onClear }) {
  const activeCount = fields.filter((field) => filters[field.name].length > 0).length

  return (
    <section aria-label="Filters" className="theme-fade card-surface space-y-3 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <PeriodSwitch filters={filters} onDateChange={onDateChange} />
        <DateRange filters={filters} onDateChange={onDateChange} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
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
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear all
          </Button>
        )}
      </div>
    </section>
  )
}
