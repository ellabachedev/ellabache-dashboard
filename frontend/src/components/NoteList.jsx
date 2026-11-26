import { Info } from 'lucide-react'

// Small notes from the API (e.g. why the period stops a day early), as quiet lines with an icon.
export default function NoteList({ notes, className = '' }) {
  if (!notes?.length) return null
  return (
    <ul className={`space-y-1 text-xs text-body ${className}`}>
      {notes.map((note) => (
        <li key={note} className="flex gap-1.5">
          <Info size={13} aria-hidden="true" className="mt-px shrink-0 text-subtle" />
          {note}
        </li>
      ))}
    </ul>
  )
}
