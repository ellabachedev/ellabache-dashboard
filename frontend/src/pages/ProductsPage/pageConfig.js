import {
  BadgeDollarSign,
  Ban,
  Database,
  Globe,
  Receipt,
  Repeat,
  Store,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { formatCount, formatMoney } from '../../utils/format.js'

// Filters shown on this page (names match the API).
export const FILTER_FIELDS = [
  { name: 'product_category', label: 'Product category' },
  { name: 'gift_card', label: 'Gift card' },
  { name: 'uniform', label: 'Uniform' },
  { name: 'state', label: 'State' },
  { name: 'salon', label: 'Salon' },
  { name: 'active_salon', label: 'Active salon' },
  { name: 'data_source', label: 'Data source' },
]

// The six cards next to each hero block (key = API field).
const cells = (labels) => [
  { key: 'transactions', label: labels.transactions, icon: Receipt, format: formatCount },
  { key: 'customers', label: 'Customers', icon: Users, format: formatCount },
  { key: 'new_customers', label: 'New customers', icon: UserPlus, format: formatCount },
  { key: 'returning_customers', label: 'Returning customers', icon: UserCheck, format: formatCount },
  { key: 'new_customer_revenue', label: 'New customer revenue', icon: BadgeDollarSign, format: formatMoney },
  { key: 'returning_customer_revenue', label: 'Returning customer revenue', icon: Repeat, format: formatMoney },
]

// Shared tags
export const SOURCE_TAG = { label: 'BigQuery', icon: Database }

// One entry per KPI section. Labels follow the Looker report; tags say what is counted.
export const KPI_SECTIONS = [
  {
    id: 'total',
    title: 'Total sales',
    tags: [
      { label: 'Salons + online', icon: Globe },
      // Salon gift cards are not revenue (is_revenue = 0); Shopify gift cards are, so they count here.
      // Full detail (incl. account payments) is in the Total revenue explanation.
      { label: 'Excl. salon gift cards & shipping', icon: Ban },
    ],
    variant: 'total',
    hero: { key: 'revenue', label: 'Total revenue' },
    aovLabel: 'Average order value',
    cells: cells({ transactions: 'Transactions' }),
  },
  {
    id: 'products',
    title: 'Product sales',
    note: 'Products only, no treatments.',
    tags: [{ label: 'Incl. salon gift cards', icon: Store }],
    variant: 'product',
    hero: { key: 'revenue', label: 'Product revenue' },
    aovLabel: 'Average order value',
    cells: cells({ transactions: 'Product transactions' }),
  },
]

export const BREAKDOWNS = [
  { by: 'category', title: 'By category' },
  { by: 'state', title: 'By state' },
  { by: 'salon', title: 'By salon' },
]

export const ITEMS_PAGE_SIZE = 15
