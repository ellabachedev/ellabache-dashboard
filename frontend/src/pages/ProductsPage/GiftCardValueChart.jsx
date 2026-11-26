import { useCallback, useMemo } from 'react'
import EChart from '../../components/EChart.jsx'
import { tooltipStyle } from '../../theme/chartColors.js'
import { formatCount, formatMoney } from '../../utils/format.js'

// "Gift card $100" -> 100, so the columns run from the smallest card value to the largest.
const cardValue = (name) => Number(/\$([\d,]+)/.exec(name ?? '')?.[1]?.replace(/,/g, '')) || Infinity
// Short axis label: "Gift card $100" -> "$100"
const shortName = (name) => (name ?? '(No name)').replace(/^gift\s*card\s*/i, '') || name

// Axis ticks are round numbers, so drop the decimals: $80K, $1.5M.
const axisMoney = (value) =>
  value.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', notation: 'compact', currencyDisplay: 'narrowSymbol' })

// Column chart: revenue for each gift card value. One series, drawn in the brand navy.
export default function GiftCardValueChart({ rows }) {
  const sorted = useMemo(() => [...rows].sort((a, b) => cardValue(a.item_name) - cardValue(b.item_name)), [rows])

  // useCallback: the chart only redraws when the data changes (or the theme, inside EChart).
  const buildOption = useCallback(
    (c) => ({
      textStyle: { fontFamily: c.font },
      grid: { left: 4, right: 4, top: 28, bottom: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: sorted.map((row) => shortName(row.item_name)),
        axisLine: { lineStyle: { color: c.grid } },
        axisTick: { show: false },
        axisLabel: { color: c.label, fontSize: 12, margin: 12 },
      },
      yAxis: {
        type: 'value',
        min: 0, // bars always start at zero
        splitNumber: 4,
        splitLine: { lineStyle: { color: c.grid } },
        axisLabel: { color: c.subtle, fontSize: 11, formatter: axisMoney },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: c.raised, opacity: 0.6 } },
        ...tooltipStyle(c),
        formatter: ([point]) => {
          const row = sorted[point.dataIndex]
          return `<div style="font-weight:600;margin-bottom:4px">${row.item_name ?? '(No name)'}</div>
            <div>Revenue <b style="margin-left:8px">${formatMoney(row.revenue)}</b></div>
            <div style="color:${c.label}">${formatCount(row.quantity)} cards · ${formatCount(row.orders)} orders</div>`
        },
      },
      series: [
        {
          type: 'bar',
          data: sorted.map((row) => row.revenue),
          barMaxWidth: 44,
          // Top-to-bottom gradient in the accent colours (one series, so colour is not data here).
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: c.accent2 },
                { offset: 1, color: c.accent },
              ],
            },
            borderRadius: [6, 6, 0, 0],
          },
          emphasis: { itemStyle: { opacity: 0.85 } },
          // Five or so columns: a value on top of each reads faster than the axis.
          label: {
            show: true,
            position: 'top',
            distance: 6,
            color: c.heading,
            fontSize: 12,
            fontWeight: 600,
            formatter: ({ value }) => formatMoney(value),
          },
        },
      ],
    }),
    [sorted],
  )

  return (
    <>
      <EChart buildOption={buildOption} height={260} ariaLabel="Column chart of gift card revenue by card value" />
      {/* Same numbers as text for screen readers */}
      <ul className="sr-only">
        {sorted.map((row) => (
          <li key={row.item_name}>
            {row.item_name}: {formatMoney(row.revenue)}, {formatCount(row.quantity)} cards
          </li>
        ))}
      </ul>
    </>
  )
}
