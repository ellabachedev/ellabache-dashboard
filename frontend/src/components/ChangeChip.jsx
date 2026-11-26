import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { TONES } from '../theme/tones.js'
import { formatChange } from '../utils/format.js'

// "vs last year" chip: arrow AND colour, so it still reads in greyscale.
// onHero = drawn on a gradient hero block (translucent white).
// compact = chip only (the card shows last year's value on its own line).
export default function ChangeChip({ change, previousText, onHero = false, compact = false }) {
  const note = onHero ? 'opacity-80' : 'text-body'
  if (change === null || change === undefined) {
    return <span className={`text-xs ${note}`}>No data last year</span>
  }
  const flat = change === 0
  const up = change > 0
  const Arrow = flat ? ArrowRight : up ? ArrowUpRight : ArrowDownRight
  let tone = flat ? TONES.neutral.chip : up ? TONES.success.chip : TONES.danger.chip
  if (onHero) tone = TONES.onHero.chip
  const chip = (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}
      title={compact ? 'Change vs same dates last year' : undefined}
    >
      <Arrow size={13} strokeWidth={2.5} aria-hidden="true" />
      {formatChange(change)}
    </span>
  )
  if (compact) return chip
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs" title={`Last year: ${previousText}`}>
      {chip}
      {/* Short note so the chip line never wraps; the section says "vs same dates last year" */}
      <span className={`whitespace-nowrap ${note}`}>from {previousText}</span>
    </span>
  )
}
