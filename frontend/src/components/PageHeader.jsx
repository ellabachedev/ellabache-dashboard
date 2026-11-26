import { ChevronRight, LayoutDashboard } from 'lucide-react'
import { TagList } from './Tag.jsx'
import ThemeToggle from './ThemeToggle.jsx'

// Top of every page:
// 1. a sticky, frosted bar (breadcrumb on the left; status + theme switch on the right) that stays
//    visible while scrolling;
// 2. the page title, an optional subtitle, and meta tags (e.g. the period).
export default function PageHeader({ section, title, subtitle, tags, children }) {
  return (
    <>
      <div className="sticky top-0 z-30 -mx-4 mb-8 flex h-16 items-center justify-between gap-4 border-b border-line bg-page/75 px-4 backdrop-blur-xl md:-mx-8 md:px-8 xl:-mx-10 xl:px-10">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
          <LayoutDashboard size={15} aria-hidden="true" className="text-subtle" />
          <span className="text-body">{section}</span>
          <ChevronRight size={14} aria-hidden="true" className="text-subtle" />
          <span className="truncate font-semibold text-heading">{title}</span>
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          {children}
          <ThemeToggle />
        </div>
      </div>

      <header className="mb-8">
        <div className="min-w-0">
          <h1 className="font-display text-[2.25rem] font-extrabold leading-none tracking-[-0.035em] text-heading md:text-[2.75rem]">
            {title}
          </h1>
          {subtitle && <p className="mt-2.5 text-[0.9375rem] text-body">{subtitle}</p>}
          <TagList tags={tags} className="mt-3.5" />
        </div>
      </header>
    </>
  )
}
