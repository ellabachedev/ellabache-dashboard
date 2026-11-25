import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { TONES } from '../theme/tones.js'
import { formatChange } from '../utils/format.js'

// "vs last year" chip: arrow AND colour, so it still reads in greyscale.
// onHero = drawn on a solid hero block, where it uses the block's own text colour.
export default function ChangeChip({ change, previousText, onHero = false }) {
  const note = onHero ? 'opacity-80' : 'text-body'
  if (change === null || change === undefined) {
    return <span className={`text-xs ${note}`}>No data last year</span>
  }
  const flat = change === 0
  const up = change > 0
  const Arrow = flat ? ArrowRight : up ? ArrowUpRight : ArrowDownRight
  let tone = flat ? TONES.neutral.chip : up ? TONES.success.chip : TONES.danger.chip
  if (onHero) tone = TONES.onHero.chip
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs" title={`Last year: ${previousText}`}>
      <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-semibold ${tone}`}>
        <Arrow size={13} strokeWidth={2.5} aria-hidden="true" />
        {formatChange(change)}
      </span>
      {/* Short note so the chip line never wraps; the section description says "vs same dates last year" */}
      <span className={`whitespace-nowrap ${note}`}>from {previousText}</span>
    </span>
  )
}
