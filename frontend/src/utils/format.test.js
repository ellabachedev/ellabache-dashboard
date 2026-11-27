import { describe, expect, it } from 'vitest'
import { toQueryString } from '../api/client.js'
import { formatChange, formatCount, formatDateRange, formatMoney, formatMoneyShort } from './format.js'

describe('formatMoneyShort', () => {
  it('drops cents below $1,000 and matches formatMoney above', () => {
    expect(formatMoneyShort(800)).toBe('$800')
    expect(formatMoneyShort(1750)).toBe('$1.75K')
    expect(formatMoneyShort(null)).toBe('—')
  })
})

describe('formatMoney', () => {
  it('matches the Looker style', () => {
    expect(formatMoney(2273039.61)).toBe('$2.27M')
    expect(formatMoney(242253.98)).toBe('$242.25K')
    expect(formatMoney(9600)).toBe('$9.60K') // compact from $1,000 so lists read consistently
    expect(formatMoney(102.27)).toBe('$102.27')
    expect(formatMoney(null)).toBe('—')
  })
})

describe('formatCount', () => {
  it('shows full numbers below 100K and compact above', () => {
    expect(formatCount(18703)).toBe('18,703')
    expect(formatCount(1900000)).toBe('1.9M')
  })
})

describe('formatChange', () => {
  it('always shows a sign', () => {
    expect(formatChange(-0.1382)).toBe('−13.8%')
    expect(formatChange(0.05)).toBe('+5.0%')
    expect(formatChange(null)).toBe('—')
  })
})

describe('formatDateRange', () => {
  it('drops the repeated year', () => {
    expect(formatDateRange('2026-11-01', '2026-11-23')).toBe('1 Nov – 23 Nov 2026')
  })
})

describe('toQueryString', () => {
  it('repeats list values and skips empty ones', () => {
    expect(toQueryString({ state: ['NSW', 'VIC'], salon: [], limit: 10 })).toBe(
      'state=NSW&state=VIC&limit=10',
    )
  })
})
