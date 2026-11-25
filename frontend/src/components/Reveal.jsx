// Wraps a page block so it fades up on first load. `step` staggers blocks 60 ms apart.
// Switched off automatically for people who prefer reduced motion (theme/motion.css).
export default function Reveal({ step = 0, children }) {
  return (
    <div className="animate-in" style={{ '--delay': `${step * 60}ms` }}>
      {children}
    </div>
  )
}
