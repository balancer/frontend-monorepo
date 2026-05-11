'use client'

import { Box, useToken } from '@chakra-ui/react'
import type { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'

export type ChartSeries = {
  name: string
  data: Array<[string | number, number]>
  color?: string
}

type Props = {
  /** Chart variant. Bar uses category x-axis, line uses value/time x-axis. */
  kind: 'bar' | 'line'
  series: ChartSeries[]
  /** X-axis labels for bar charts. Ignored for line charts (which read x from data tuples). */
  xLabels?: string[]
  /** Pixel height. Defaults to 320. */
  height?: number
  /** Format y values. Defaults to compact USD. */
  valueFormatter?: (n: number) => string
  /** Show horizontal layout for bar charts. */
  horizontal?: boolean
}

const defaultUsdFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 2,
})

export function TimeSeriesChart({
  kind,
  series,
  xLabels,
  height = 320,
  valueFormatter = n => defaultUsdFmt.format(n),
  horizontal = false,
}: Props) {
  const [
    fontColor,
    secondaryColor,
    gridColor,
    tooltipBg,
    tooltipBorder,
    accentFrom,
    accentTo,
  ] = useToken('colors', [
    'font.primary',
    'font.secondary',
    'border.base',
    'background.level2',
    'border.base',
    'green.500',
    'blue.500',
  ])

  const option = useMemo<EChartsOption>(() => {
    const valueAxis = {
      type: 'value' as const,
      axisLabel: {
        color: secondaryColor,
        formatter: (v: number) => valueFormatter(v),
      },
      splitLine: { lineStyle: { color: gridColor, opacity: 0.3 } },
    }

    const categoryAxis = {
      type: 'category' as const,
      data: xLabels ?? [],
      axisLabel: { color: secondaryColor },
      axisLine: { lineStyle: { color: gridColor } },
    }

    return {
      grid: { top: 24, right: 16, bottom: 32, left: horizontal ? 96 : 56 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textStyle: { color: fontColor },
        valueFormatter: (v: unknown) => {
          const n = typeof v === 'number' ? v : Number(v)
          return Number.isFinite(n) ? valueFormatter(n) : String(v ?? '')
        },
      },
      xAxis: kind === 'bar' && horizontal ? valueAxis : categoryAxis,
      yAxis: kind === 'bar' && horizontal ? categoryAxis : valueAxis,
      series: series.map((s, i) => ({
        name: s.name,
        type: kind,
        data: s.data.map(d => d[1]),
        itemStyle: {
          color: s.color ?? (i % 2 === 0 ? accentFrom : accentTo),
          borderRadius: kind === 'bar' ? (horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]) : undefined,
        },
        smooth: kind === 'line',
        showSymbol: false,
      })),
    }
  }, [
    kind,
    series,
    xLabels,
    horizontal,
    valueFormatter,
    fontColor,
    secondaryColor,
    gridColor,
    tooltipBg,
    tooltipBorder,
    accentFrom,
    accentTo,
  ])

  return (
    <Box>
      <ReactECharts option={option} style={{ height: `${height}px`, width: '100%' }} />
    </Box>
  )
}
