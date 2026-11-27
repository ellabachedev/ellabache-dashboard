import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const WIDTH = 288 // popover width in px (w-72)
const GUTTER = 16 // keep this far from the screen edge

// Where to draw the popover: under the label, or above it when there is no room below.
// It is drawn in <body> ("portal") with fixed coordinates so cards and animations can't clip it.
function placeNear(rect) {
  const left = Math.min(Math.max(rect.left, GUTTER), window.innerWidth - WIDTH - GUTTER)
  const roomBelow = window.innerHeight - rect.bottom > 220
  return roomBelow ? { left, top: rect.bottom + 6 } : { left, bottom: window.innerHeight - rect.top + 6 }
}

// The explanation box: what it shows, an example, and a caveat.
export function HelpText({ help }) {
  return (
    <>
      <p className="text-sm leading-5 text-body">{help.text}</p>
      {help.example && <p className="mt-2 text-xs leading-5 text-subtle">E.g. {help.example}</p>}
      {help.note && <p className="mt-2 text-xs leading-5 text-subtle">Note: {help.note}</p>}
    </>
  )
}

// A metric label with a faint dotted underline. Hover (mouse), tap (touch) or focus (keyboard)
// shows a short plain explanation. Without `help` it renders the plain label.
export default function InfoLabel({ label, help, className = '' }) {
  const [position, setPosition] = useState(null)
  const buttonRef = useRef(null)
  const id = useId()

  const open = () => setPosition(placeNear(buttonRef.current.getBoundingClientRect()))
  const close = () => setPosition(null)

  // Close on Escape, on scroll or resize (the label moved), or on a tap elsewhere.
  useEffect(() => {
    if (!position) return undefined
    const onKey = (event) => event.key === 'Escape' && close()
    const onTapOutside = (event) => !buttonRef.current?.contains(event.target) && close()
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    document.addEventListener('pointerdown', onTapOutside)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      document.removeEventListener('pointerdown', onTapOutside)
    }
  }, [position])

  if (!help) return <span className={className}>{label}</span>

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={Boolean(position)}
        aria-describedby={position ? id : undefined}
        // Mouse: show while hovering. Touch: a tap toggles it (handled by onClick).
        onPointerEnter={(event) => event.pointerType === 'mouse' && open()}
        onPointerLeave={(event) => event.pointerType === 'mouse' && close()}
        onFocus={open}
        onBlur={close}
        onClick={() => (position ? close() : open())}
        className={`cursor-help rounded-sm text-left underline decoration-current/35 decoration-dotted decoration-1 underline-offset-4 hover:decoration-current/70 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
      >
        {label}
      </button>
      {position &&
        createPortal(
          <div
            id={id}
            role="tooltip"
            style={{ ...position, width: WIDTH }}
            className="pointer-events-none fixed z-50 rounded-xl border border-line bg-card p-3.5 text-left shadow-card-hover"
          >
            <p className="mb-1 text-[0.8125rem] font-semibold text-heading">{help.term ?? label}</p>
            <HelpText help={help} />
          </div>,
          document.body,
        )}
    </>
  )
}
