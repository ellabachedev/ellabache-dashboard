import {
  Gem,
  Gift,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  ShoppingBag,
  Smile,
  Sparkles,
  Store,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import BrandLogo from './BrandLogo.jsx'

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

// One menu row. On the narrow icon rail (laptops, or when collapsed) the label is hidden and shown
// as a tooltip instead; when the sidebar is open on a wide screen the full label is visible.
// "wide:" (defined in index.css) = wide screen AND sidebar open.
// Rows are .nav-item (theme/buttons.css): flat until hovered; the current page is a white key with
// navy text; pressing sinks it 1px. Unbuilt pages say "coming soon" in the tooltip.
function MenuItem({ item, active }) {
  const Icon = item.icon
  return (
    <li>
      <span
        aria-current={active ? 'page' : undefined}
        title={active ? item.label : `${item.label} (coming soon)`}
        className={`nav-item group relative flex h-9 cursor-pointer select-none items-center justify-center gap-2.5 rounded-lg text-[0.8125rem] wide:justify-start wide:px-2.5 ${
          active ? 'is-current font-semibold' : 'font-medium'
        }`}
      >
        {/* The icon nudges right on hover: a small cue that the row responds */}
        <Icon
          size={17}
          strokeWidth={active ? 2.25 : 1.75}
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5 ${
            active ? '' : 'text-sidebar-muted group-hover:text-heading'
          }`}
        />
        <span className="hidden flex-1 truncate wide:inline">{item.label}</span>
      </span>
    </li>
  )
}

// Small "EB" monogram for the narrow icon rail, where the full wordmark would be too small to read.
function Monogram() {
  return (
    <span className="font-display flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-logo text-xs font-bold tracking-tight text-sidebar">
      EB
    </span>
  )
}

// Collapse / expand button (wide screens only; laptops always get the icon rail).
function CollapseButton({ collapsed, onToggle }) {
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose
  const label = collapsed ? 'Expand sidebar' : 'Collapse sidebar'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-expanded={!collapsed}
      title={label}
      className="nav-item mb-1 hidden h-9 w-full items-center justify-center gap-2.5 rounded-lg text-[0.8125rem] font-medium focus:outline-none focus-visible:outline-2 focus-visible:outline-accent xl:flex wide:justify-start wide:px-2.5"
    >
      <Icon size={17} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-sidebar-muted" />
      <span className="hidden wide:inline">Collapse</span>
    </button>
  )
}

function Sidebar({ activePage, collapsed, onToggle }) {
  return (
    <aside className="sticky top-0 flex h-screen flex-col overflow-y-auto px-3 py-5">
      {/* Brand */}
      <div className="flex justify-center px-1 pb-7 wide:block wide:px-2.5">
        <span className="wide:hidden">
          <Monogram />
        </span>
        {/* Official Ella Baché wordmark (navy on the light sidebar, white in dark mode) */}
        <div className="hidden wide:block">
          <BrandLogo className="h-8 w-auto text-sidebar-logo" />
          <p className="mt-2 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-sidebar-muted">
            Analytics
          </p>
        </div>
      </div>

      <nav aria-label="Pages" className="mb-6 flex-1 space-y-5">
        {MENU.map((group) => (
          <div key={group.section}>
            <p className="hidden px-2.5 pb-1.5 text-xs font-semibold text-sidebar-muted wide:block">
              {group.section}
            </p>
            {/* Thin divider replaces the group label on the icon rail */}
            <span aria-hidden="true" className="mx-auto mb-2 block h-px w-6 bg-sidebar-edge wide:hidden" />
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <MenuItem key={item.id} item={item} active={item.id === activePage} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <CollapseButton collapsed={collapsed} onToggle={onToggle} />

      {/* Who is using it */}
      <div className="flex items-center justify-center gap-2.5 border-t border-sidebar-edge px-1 pt-3 wide:justify-start wide:px-2.5">
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-logo text-[0.625rem] font-bold text-sidebar">
          MT
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-sidebar" />
        </span>
        <span className="hidden min-w-0 wide:block">
          <span className="block truncate text-[0.8125rem] font-semibold text-heading">Marketing team</span>
          <span className="block truncate text-xs text-sidebar-muted">Internal · prototype</span>
        </span>
      </div>
    </aside>
  )
}

const SIDEBAR_KEY = 'eb-sidebar'

// Read the saved open/collapsed choice (storage can be blocked in private windows).
function savedCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'collapsed'
  } catch {
    return false
  }
}

// Page frame: sidebar on the left (icon rail on laptops, full on wide screens unless collapsed),
// content on the right.
export default function Layout({ activePage, children }) {
  const [collapsed, setCollapsed] = useState(savedCollapsed)

  // Remember the choice in this browser.
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? 'collapsed' : 'expanded')
    } catch {
      // Storage blocked: the choice still works for this visit.
    }
  }, [collapsed])

  return (
    // data-sidebar drives the "wide:" variant used inside the sidebar.
    <div className="flex min-h-screen" data-sidebar={collapsed ? 'collapsed' : 'expanded'}>
      {/* Outer column paints the sidebar full height; the inner menu stays in view while scrolling. */}
      <div className="sidebar-surface hidden w-[76px] shrink-0 transition-[width] duration-200 ease-out lg:block wide:w-64">
        <Sidebar activePage={activePage} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      <main className="min-w-0 flex-1">
        {/* Phones and tablets: the sidebar is hidden, so show the brand in a slim top bar. */}
        <div className="flex items-center gap-3 border-b border-sidebar-edge bg-sidebar px-4 py-3.5 lg:hidden">
          <BrandLogo className="h-5 w-auto text-sidebar-logo" />
          <span aria-hidden="true" className="h-4 w-px bg-sidebar-edge" />
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-sidebar-muted">Analytics</p>
        </div>
        <div className="mx-auto max-w-[1440px] px-4 pb-12 md:px-8 xl:px-10">{children}</div>
      </main>
    </div>
  )
}
