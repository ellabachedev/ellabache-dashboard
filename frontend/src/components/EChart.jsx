import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { useEffect, useRef } from 'react'
import { useTheme } from '../hooks/useTheme.js'
import { readChartColors } from '../theme/chartColors.js'

// Load only the ECharts parts we use (keeps the app small). SVG = sharp text at any zoom.
echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, SVGRenderer])

// An ECharts chart that follows light/dark mode and resizes with its panel.
// buildOption(colors) returns the ECharts "option" object; colors come from theme/chartColors.js.
// Wrap buildOption in useCallback in the parent so the chart only redraws when its data changes.
export default function EChart({ buildOption, height = 280, ariaLabel }) {
  const boxRef = useRef(null)
  const chartRef = useRef(null)
  const { theme } = useTheme()

  // Create the chart once; resize it whenever its box changes width.
  useEffect(() => {
    const chart = echarts.init(boxRef.current, null, { renderer: 'svg' })
    chartRef.current = chart
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(boxRef.current)
    return () => {
      observer.disconnect()
      chart.dispose()
    }
  }, [])

  // Redraw with fresh colours when the data or theme changes. The theme provider updates the page
  // colours in its own effect (which runs after this one), so wait one frame before reading them.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      chartRef.current?.setOption({ animation: !reduceMotion, ...buildOption(readChartColors()) }, true)
    })
    return () => cancelAnimationFrame(frame)
  }, [buildOption, theme])

  return <div ref={boxRef} role="img" aria-label={ariaLabel} style={{ height }} className="w-full" />
}
