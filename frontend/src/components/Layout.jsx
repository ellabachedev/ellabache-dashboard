import {
  BarChart3,
  Gem,
  Gift,
  Globe,
  Share2,
  ShoppingBag,
  Smile,
  Sparkles,
  Store,
  TrendingUp,
} from 'lucide-react'

// Left menu, grouped like the Looker report. Only "products" is built so far.
const MENU = [
  {
    section: 'Sales',
    items: [
      { id: 'products', label: 'Products', icon: ShoppingBag },
      { id: 'treatments', label: 'Treatments', icon: Sparkles },
      { id: 'salons', label: 'Salons YoY', icon: Store },
      { id: 'gifts', label: 'Gift products', icon: Gift },
    ],
  },
  {
    section: 'Customers',
    items: [
      { id: 'trends', label: 'Trends', icon: TrendingUp },
      { id: 'ltv', label: 'Lifetime value', icon: Gem },
      { id: 'nps', label: 'NPS over time', icon: Smile },
    ],
  },
  {
    section: 'Online',
    items: [
      { id: 'ecommerce', label: 'Ecommerce', icon: Globe },
      { id: 'sources', label: 'Sources', icon: Share2 },
    ],
  },
]

// One menu row. On laptops (lg) the sidebar is a narrow icon rail, so the label is hidden
// and shown as a tooltip instead; on wide screens (xl) the full label is visible.
function MenuItem({ item, active }) {
  const Icon = item.icon
  return (
    <li>
      <span
        aria-current={active ? 'page' : undefined}
        title={active ? item.label : `${item.label} (coming soon)`}
        className={`group relative flex h-10 items-center justify-center gap-3 rounded-lg text-sm transition-colors duration-150 xl:justify-start xl:px-3 ${
          active ? 'bg-white/10 font-semibold text-white' : 'text-sidebar-text hover:bg-white/[0.06] hover:text-white'
        }`}
      >
        {/* Accent marker on the active page */}
        {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent" />}
        {/* The icon nudges right on hover: a small cue that the row responds */}
        <Icon
          size={18}
          strokeWidth={active ? 2.25 : 1.75}
          aria-hidden="true"
          className="shrink-0 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
        />
        <span className="hidden flex-1 truncate xl:inline">{item.label}</span>
        {!active && (
          <span className="hidden rounded-full bg-white/[0.06] px-2 py-0.5 text-[0.6875rem] font-medium text-sidebar-muted xl:inline">
            Soon
          </span>
        )}
      </span>
    </li>
  )
}

function Sidebar({ activePage }) {
  return (
    <aside className="sticky top-0 flex h-screen flex-col overflow-y-auto px-3 py-5">
      {/* Brand */}
      <div className="flex items-center justify-center gap-3 px-1 pb-6 xl:justify-start xl:px-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
          <BarChart3 size={18} strokeWidth={2.25} aria-hidden="true" />
        </span>
        <span className="hidden xl:block">
          <span className="block text-[0.9375rem] font-bold leading-tight tracking-tight text-white">Ella Baché</span>
          <span className="block text-xs text-sidebar-muted">Analytics</span>
        </span>
      </div>

      <nav aria-label="Pages" className="flex-1 space-y-5">
        {MENU.map((group) => (
          <div key={group.section}>
            <p className="hidden px-3 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-sidebar-muted xl:block">
              {group.section}
            </p>
            {/* Thin divider replaces the group label on the icon rail */}
            <span aria-hidden="true" className="mx-auto mb-2 block h-px w-6 bg-white/10 xl:hidden" />
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <MenuItem key={item.id} item={item} active={item.id === activePage} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Who is using it */}
      <div className="mt-4 flex items-center justify-center gap-3 rounded-lg border border-white/10 p-2 xl:justify-start">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
          MT
        </span>
        <span className="hidden min-w-0 xl:block">
          <span className="block truncate text-sm font-medium text-white">Marketing team</span>
          <span className="block truncate text-xs text-sidebar-muted">Internal · prototype</span>
        </span>
      </div>
    </aside>
  )
}

// Page frame: sidebar on the left (icon rail on laptops, full on wide screens), content on the right.
export default function Layout({ activePage, children }) {
  return (
    <div className="flex min-h-screen">
      {/* Outer column paints the sidebar full height; the inner menu stays in view while scrolling. */}
      <div className="hidden w-[72px] shrink-0 bg-sidebar lg:block xl:w-64">
        <Sidebar activePage={activePage} />
      </div>

      <main className="min-w-0 flex-1">
        {/* Phones and tablets: the sidebar is hidden, so show the brand in a slim top bar. */}
        <div className="flex items-center gap-2.5 bg-sidebar px-4 py-3 lg:hidden">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
            <BarChart3 size={15} strokeWidth={2.25} aria-hidden="true" />
          </span>
          <p className="text-sm font-bold tracking-tight text-white">Ella Baché</p>
          <p className="text-xs text-sidebar-muted">Analytics</p>
        </div>
        <div className="mx-auto max-w-[1400px] px-4 pb-10 md:px-8 xl:px-10">{children}</div>
      </main>
    </div>
  )
}
