import { TagList } from './Tag.jsx'

// Section heading: title, a short plain sentence, and meta tags
// (scope, source) as pills underneath. `children` sits on the right (e.g. a button).
export default function SectionTitle({ title, note, tags, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div>
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-heading sm:text-[1.375rem]">{title}</h2>
          {note && <p className="mt-0.5 text-sm text-body">{note}</p>}
          <TagList tags={tags} className="mt-2.5" />
        </div>
      </div>
      {children}
    </div>
  )
}
