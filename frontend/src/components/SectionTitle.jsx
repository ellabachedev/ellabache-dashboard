// Section heading: title with a short description underneath, optional extra on the right.
export default function SectionTitle({ title, note, children }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-heading">{title}</h2>
        {note && <p className="mt-0.5 text-sm text-body">{note}</p>}
      </div>
      {children}
    </div>
  )
}
