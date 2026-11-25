import { ChevronRight } from 'lucide-react'
import ThemeToggle from './ThemeToggle.jsx'

// Top of every page:
// 1. a sticky bar (breadcrumb on the left; status + theme switch on the right) that stays visible
//    while scrolling, slightly see-through so content slides under it;
// 2. the big page title with a one-line subtitle (e.g. the compared period).
export default function PageHeader({ section, title, subtitle, children }) {
  return (
    <>
      <div className="sticky top-0 z-30 -mx-4 mb-6 flex h-14 items-center justify-between gap-4 border-b border-line bg-page/85 px-4 backdrop-blur md:-mx-8 md:px-8 xl:-mx-10 xl:px-10">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
          <span className="text-body">{section}</span>
          <ChevronRight size={14} aria-hidden="true" className="text-subtle" />
          <span className="truncate font-medium text-heading">{title}</span>
        </nav>
        <div className="flex shrink-0 items-center gap-4">
          {children}
          <ThemeToggle />
        </div>
      </div>

      <header className="mb-8">
        <h1 className="text-[2.5rem] font-bold leading-none tracking-[-0.035em] text-heading md:text-[3rem]">{title}</h1>
        {subtitle && <p className="mt-3 text-[0.9375rem] text-body">{subtitle}</p>}
      </header>
    </>
  )
}
