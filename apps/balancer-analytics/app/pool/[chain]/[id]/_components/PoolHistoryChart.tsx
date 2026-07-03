'use client'

import { Box, Button, Flex, Text } from '@chakra-ui/react'
import type { ECharts } from 'echarts/core'
import ReactECharts from 'echarts-for-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PoolPageData } from '../page'
import { CATEGORY_ORDER, EVENT_STYLES, getEventStyle, type EventCategory } from './eventStyles'
import { formatEventArgValue } from './formatEventArgs'

const usdCompact = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n || 0)

const usdFull = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n || 0)

const dateLabelFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

// Palette mirrors frontend-v3's pool-detail chart (PoolChartsProvider.tsx)
// so the analytics pool page reads as part of the same product family. Bright
// foreground colors against the dark subSection background — the earlier
// gray-on-gray combination was barely readable.
const CHART_COLORS = {
  tvlLine: '#2554ff', // blue-600 (frontend-v3 TVL line)
  tvlAreaFrom: 'rgba(14, 165, 233, 0.22)', // cyan-500 @ 22%
  tvlAreaTo: 'rgba(68, 9, 236, 0.0)', // purple, fades to transparent
  volumeFrom: 'rgba(0, 211, 149, 1)', // green @ 100%
  volumeTo: 'rgba(0, 211, 149, 0.25)', // green @ 25%
  fees: '#fb923c', // orange-400 (frontend-v3 fees bar)
  axisLabel: 'rgba(255, 255, 255, 0.6)',
  splitLine: 'rgba(255, 255, 255, 0.06)',
  cursor: '#fbbf24', // amber-400 — distinct from blue TVL + orange fees
  cursorLabelText: '#1a1a22',
  tooltipBg: 'rgba(20, 20, 28, 0.96)',
  tooltipBorder: 'rgba(255, 255, 255, 0.08)',
  tooltipHead: '#E5D3BE', // tan accent (frontend-v3 tooltip heading)
  tooltipBody: '#cbd5e1', // slate-300
} as const

type Snapshot = PoolPageData['snapshots'][number]
type Ev = PoolPageData['events'][number]

/**
 * Linear interpolate TVL at a given timestamp from the snapshot series.
 * Snapshots are daily-bucketed; events between snapshots get the lerp of
 * the surrounding two. Outside the series range we clamp to the nearest
 * edge.
 */
function tvlAt(snapshots: Snapshot[], ts: number): number {
  if (snapshots.length === 0) return 0
  if (ts <= snapshots[0].timestamp) return snapshots[0].totalLiquidity
  const last = snapshots[snapshots.length - 1]
  if (ts >= last.timestamp) return last.totalLiquidity
  for (let i = 1; i < snapshots.length; i++) {
    const a = snapshots[i - 1]
    const b = snapshots[i]
    if (ts >= a.timestamp && ts <= b.timestamp) {
      const t = (ts - a.timestamp) / Math.max(1, b.timestamp - a.timestamp)
      return a.totalLiquidity + (b.totalLiquidity - a.totalLiquidity) * t
    }
  }
  return last.totalLiquidity
}

type MarkPoint = {
  coord: [number, number]
  itemStyle: { color: string }
  symbol: string
  symbolSize: number
  symbolOffset?: [number, number]
  label: {
    show: boolean
    formatter: string
    color: string
    fontSize: number
    fontWeight: number
    offset: [number, number]
  }
  meta: { event: Ev }
}

export function PoolHistoryChart({
  snapshots,
  events,
  cursors,
  onCursorClick,
}: {
  snapshots: PoolPageData['snapshots']
  events: PoolPageData['events']
  /** Two-cursor compare-mode positions, unix-seconds. `null` slots mean
   *  "no cursor set yet" — visible markers only render for set slots. */
  cursors?: { a: number | null; b: number | null }
  /** Called with a clicked-grid x-axis timestamp (unix seconds). Receives
   *  clicks anywhere inside the plot area, not just on series points. */
  onCursorClick?: (timestamp: number) => void
}): React.JSX.Element {
  // Per-event-name counts for the legend chip strip. Ordered later by
  // category to match the chart's color story.
  const eventCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of events) counts[e.eventName] = (counts[e.eventName] ?? 0) + 1
    return counts
  }, [events])

  // Clicking a legend chip toggles event-name visibility on the chart.
  // Disabled names get filtered out of `inRangeEvents` (markers + lines)
  // and out of the amp markArea so users can quickly isolate a specific
  // event family. Visible chip dim signals the disabled state.
  const [disabled, setDisabled] = useState<Set<string>>(new Set())
  const toggleEventName = useCallback((name: string) => {
    setDisabled(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }, [])
  const resetEventNames = useCallback(() => setDisabled(new Set()), [])

  // Group event names by category for the legend's visual sectioning.
  const legendGroups = useMemo(() => {
    const byCategory = new Map<EventCategory, string[]>()
    for (const name of Object.keys(eventCounts)) {
      const cat = getEventStyle(name).category
      if (!byCategory.has(cat)) byCategory.set(cat, [])
      byCategory.get(cat)!.push(name)
    }
    // Stable alphabetic order within each group.
    for (const arr of byCategory.values()) arr.sort()
    return CATEGORY_ORDER.flatMap(cat => byCategory.get(cat) ?? [])
  }, [eventCounts])

  const option = useMemo(() => {
    const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp)
    const tvlSeries = sorted.map(s => [s.timestamp * 1000, s.totalLiquidity] as const)
    const volSeries = sorted.map(s => [s.timestamp * 1000, s.volume24h] as const)
    const feeSeries = sorted.map(s => [s.timestamp * 1000, s.fees24h] as const)

    const seriesStart = sorted[0]?.timestamp ?? 0
    const seriesEnd = sorted[sorted.length - 1]?.timestamp ?? 0

    const inRangeEvents = events.filter(
      e =>
        e.blockTimestamp >= seriesStart &&
        e.blockTimestamp <= seriesEnd &&
        !disabled.has(e.eventName)
    )

    // Pins, one per event. Even-indexed pins drop slightly so labels of
    // adjacent same-day events don't stack on top of each other.
    const markPoints: MarkPoint[] = inRangeEvents.map((e, idx) => {
      const style = getEventStyle(e.eventName)
      return {
        coord: [e.blockTimestamp * 1000, tvlAt(sorted, e.blockTimestamp)],
        itemStyle: { color: style.color },
        symbol: 'pin',
        symbolSize: 34,
        symbolOffset: [0, idx % 2 === 0 ? -2 : 16],
        label: {
          show: true,
          formatter: style.pinLabel,
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          offset: [0, -2],
        },
        meta: { event: e },
      }
    })

    // Vertical dashed lines at every in-range event — visible regardless of
    // y-axis value, drawn under the pins (`z: 1`).
    const markLines: Array<{
      xAxis: number
      lineStyle: { color: string; type: 'dashed' | 'solid'; width: number; opacity: number }
      label: {
        show: boolean
        formatter?: string
        position?: string
        color?: string
        fontWeight?: number
        fontSize?: number
        backgroundColor?: string
        padding?: number[]
        borderRadius?: number
      }
    }> = inRangeEvents.map(e => {
      const style = getEventStyle(e.eventName)
      return {
        xAxis: e.blockTimestamp * 1000,
        lineStyle: {
          color: style.color,
          type: 'dashed' as const,
          width: 1,
          opacity: 0.55,
        },
        label: { show: false },
      }
    })

    // Compare-mode cursors — solid, opaque, labelled. Drawn over the
    // dashed event lines so they're always identifiable, even when an
    // event happens at the exact cursor instant. Amber chosen to stand
    // apart from both the blue TVL line and the orange fees bars.
    const cursorColor = CHART_COLORS.cursor
    if (cursors?.a != null) {
      markLines.push({
        xAxis: cursors.a * 1000,
        lineStyle: { color: cursorColor, type: 'solid', width: 2, opacity: 0.9 },
        label: {
          show: true,
          formatter: 'A',
          position: 'insideEndTop',
          color: CHART_COLORS.cursorLabelText,
          fontWeight: 700,
          fontSize: 11,
          backgroundColor: cursorColor,
          padding: [2, 6, 2, 6],
          borderRadius: 4,
        },
      })
    }
    if (cursors?.b != null) {
      markLines.push({
        xAxis: cursors.b * 1000,
        lineStyle: { color: cursorColor, type: 'solid', width: 2, opacity: 0.9 },
        label: {
          show: true,
          formatter: 'B',
          position: 'insideEndTop',
          color: CHART_COLORS.cursorLabelText,
          fontWeight: 700,
          fontSize: 11,
          backgroundColor: cursorColor,
          padding: [2, 6, 2, 6],
          borderRadius: 4,
        },
      })
    }

    // Amp ramps → translucent markArea between AmpUpdateStarted.startTime
    // and endTime so the "ramp in progress" window is visible at a glance.
    const ampAreas: [{ xAxis: number; itemStyle: { color: string } }, { xAxis: number }][] = []
    for (const e of events) {
      if (e.eventName !== 'AmpUpdateStarted') continue
      // Hide the ramp area when the user has toggled AmpUpdateStarted off.
      if (disabled.has(e.eventName)) continue
      const startTime = Number(e.args.startTime ?? 0)
      const endTime = Number(e.args.endTime ?? 0)
      if (!startTime || !endTime || endTime <= startTime) continue
      ampAreas.push([
        { xAxis: startTime * 1000, itemStyle: { color: 'rgba(245, 158, 11, 0.14)' } },
        { xAxis: endTime * 1000 },
      ])
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: { color: CHART_COLORS.axisLabel, opacity: 0.4 },
          lineStyle: { color: CHART_COLORS.axisLabel, opacity: 0.4 },
        },
        backgroundColor: CHART_COLORS.tooltipBg,
        borderColor: CHART_COLORS.tooltipBorder,
        textStyle: { color: CHART_COLORS.tooltipBody, fontSize: 12 },
        padding: [10, 12, 10, 12],
        formatter: (rawParams: unknown) => {
          const params = rawParams as Array<{
            seriesName: string
            seriesType: string
            data: [number, number]
            color: unknown
          }>
          if (!params?.length) return ''
          const ts = params[0].data[0]
          const date = new Date(ts).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
          // ECharts returns the original `itemStyle.color` for series in
          // tooltip params — strings pass through, but gradient objects
          // would render as "[object Object]" when interpolated. Map by
          // series name to a solid base color for the tooltip swatch.
          const TOOLTIP_SWATCH: Record<string, string> = {
            TVL: CHART_COLORS.tvlLine,
            'Volume 24h': CHART_COLORS.volumeFrom,
            'Fees 24h': CHART_COLORS.fees,
          }
          const swatchFor = (p: { seriesName: string; color: unknown }): string =>
            typeof p.color === 'string'
              ? p.color
              : TOOLTIP_SWATCH[p.seriesName] ?? CHART_COLORS.tvlLine
          const lines = params
            .filter(p => p.seriesType !== undefined)
            .map(
              p =>
                `<div style="display:flex;justify-content:space-between;gap:14px;line-height:1.5;">
                  <span style="color:${CHART_COLORS.tooltipBody};"><span style="display:inline-block;width:8px;height:8px;background:${swatchFor(p)};border-radius:50%;margin-right:6px;vertical-align:middle;"></span>${p.seriesName}</span>
                  <span style="font-family:ui-monospace,monospace;color:#fff;font-weight:500;">${usdFull(p.data[1])}</span>
                </div>`
            )
          return `<div><div style="color:${CHART_COLORS.tooltipHead};font-weight:600;margin-bottom:6px;font-size:11px;letter-spacing:0.02em;text-transform:uppercase;">${date}</div>${lines.join('')}</div>`
        },
      },
      legend: {
        data: ['TVL', 'Volume 24h', 'Fees 24h'],
        bottom: 4,
        textStyle: { fontSize: 11, color: CHART_COLORS.axisLabel },
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
      },
      grid: {
        top: 28,
        left: 56,
        right: 64,
        bottom: 48,
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (val: number) => dateLabelFmt.format(new Date(val)),
          fontSize: 10,
          color: CHART_COLORS.axisLabel,
        },
        axisLine: { lineStyle: { color: CHART_COLORS.splitLine } },
        axisTick: { lineStyle: { color: CHART_COLORS.splitLine } },
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          position: 'left',
          axisLabel: {
            formatter: (val: number) => usdCompact(val),
            fontSize: 10,
            color: CHART_COLORS.axisLabel,
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        },
        {
          type: 'value',
          position: 'right',
          axisLabel: {
            formatter: (val: number) => usdCompact(val),
            fontSize: 10,
            color: CHART_COLORS.axisLabel,
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'TVL',
          type: 'line',
          yAxisIndex: 0,
          data: tvlSeries,
          smooth: true,
          symbol: 'none',
          itemStyle: { color: CHART_COLORS.tvlLine },
          lineStyle: { color: CHART_COLORS.tvlLine, width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: CHART_COLORS.tvlAreaFrom },
                { offset: 1, color: CHART_COLORS.tvlAreaTo },
              ],
            },
          },
          markPoint: markPoints.length
            ? {
                z: 10,
                data: markPoints,
                tooltip: {
                  formatter: (raw: unknown) => {
                    const params = raw as { data?: MarkPoint }
                    const e = params.data?.meta?.event
                    if (!e) return ''
                    const style = getEventStyle(e.eventName)
                    const date = new Date(e.blockTimestamp * 1000).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                    const argRows = Object.entries(e.args)
                      .map(
                        ([k, v]) =>
                          `<div style="display:flex;justify-content:space-between;gap:14px;">
                            <span style="opacity:0.7;">${k}</span>
                            <span style="font-family:ui-monospace,monospace;">${formatEventArgValue(k, v)}</span>
                          </div>`
                      )
                      .join('')
                    return `<div style="max-width:300px;">
                      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                        <span style="display:inline-block;width:8px;height:8px;background:${style.color};border-radius:50%;"></span>
                        <span style="font-weight:600;">${style.legendLabel}</span>
                      </div>
                      <div style="opacity:0.7;margin-bottom:8px;font-size:11px;">${e.eventName} · ${date}</div>
                      ${argRows}
                    </div>`
                  },
                },
              }
            : undefined,
          markLine: markLines.length
            ? {
                z: 1,
                silent: true,
                symbol: ['none', 'none'],
                animation: false,
                data: markLines,
              }
            : undefined,
          markArea: ampAreas.length ? { silent: true, data: ampAreas } : undefined,
        },
        {
          name: 'Volume 24h',
          type: 'bar',
          yAxisIndex: 1,
          data: volSeries,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: CHART_COLORS.volumeFrom },
                { offset: 1, color: CHART_COLORS.volumeTo },
              ],
            },
            borderRadius: [3, 3, 0, 0],
          },
          barCategoryGap: '30%',
        },
        {
          name: 'Fees 24h',
          type: 'bar',
          yAxisIndex: 1,
          data: feeSeries,
          itemStyle: { color: CHART_COLORS.fees, borderRadius: [3, 3, 0, 0] },
          barCategoryGap: '30%',
          stack: 'overlay',
        },
      ],
    }
  }, [snapshots, events, cursors, disabled])

  // ── Compare-mode click handler ─────────────────────────────────────────
  // Bound via zrender (the low-level canvas layer beneath echarts) so we
  // catch clicks anywhere inside the plot rectangle, not just on series
  // points. `containPixel('grid', [x,y])` guards against accidental
  // clicks on axes / legend; `convertFromPixel` returns the data-domain
  // timestamp at the clicked x pixel.
  // echarts' public typings don't surface `getZr` or `convertFromPixel`
  // narrowly — define a local minimal shape rather than `as any` everything.
  type ZrEvent = { offsetX: number; offsetY: number }
  type EChartsLowLevel = ECharts & {
    getZr: () => {
      on: (event: 'click', handler: (e: ZrEvent) => void) => void
      off: (event: 'click', handler: (e: ZrEvent) => void) => void
    }
    containPixel: (target: 'grid', point: [number, number]) => boolean
    convertFromPixel: (axis: { xAxisIndex: 0 }, x: number) => number
  }
  const chartRef = useRef<{ getEchartsInstance: () => ECharts } | null>(null)
  useEffect(() => {
    if (!onCursorClick) return
    const instance = chartRef.current?.getEchartsInstance() as EChartsLowLevel | undefined
    if (!instance) return
    const handler = (e: ZrEvent): void => {
      // Only trigger on clicks inside the plot grid — clicks on legend /
      // axes / outside should be no-ops so users can interact with chart
      // chrome without accidentally arming a cursor.
      if (!instance.containPixel('grid', [e.offsetX, e.offsetY])) return
      const tsMs = instance.convertFromPixel({ xAxisIndex: 0 }, e.offsetX)
      if (!Number.isFinite(tsMs)) return
      onCursorClick(Math.round(tsMs / 1000))
    }
    const zr = instance.getZr()
    zr.on('click', handler)
    return () => zr.off('click', handler)
  }, [onCursorClick])

  if (snapshots.length === 0) {
    return (
      <Box opacity={0.6} py="xl" textAlign="center">
        No snapshot data available for this pool.
      </Box>
    )
  }

  const hasEvents = legendGroups.length > 0

  return (
    // Flex column so the chart Box below can claim the remaining vertical
    // space via `flex="1" minH={0}`. Without this the parent's `height: 100%`
    // doesn't propagate and ECharts' size-sensor falls back to ~100px,
    // producing a totally flat canvas on wide viewports (see screenshot
    // bug 2: `<canvas width="747" height="100">`).
    <Box display="flex" flexDirection="column" h="full" w="full">
      {hasEvents && (
        // Interactive legend: click a chip to toggle that event name's
        // pins, lines, and (for AmpUpdateStarted) the markArea. Disabled
        // chips dim and the dot becomes a hollow ring so the off state
        // reads unambiguously. A "Reset" link appears when anything is
        // disabled so users can recover all visibility in one click.
        <Flex
          color="font.secondary"
          columnGap="md"
          flexWrap="wrap"
          mb="md"
          rowGap="2xs"
        >
          {legendGroups.map(name => {
            const style = EVENT_STYLES[name] ?? getEventStyle(name)
            const count = eventCounts[name]
            const isOff = disabled.has(name)
            return (
              <Flex
                _hover={{ opacity: 1 }}
                align="center"
                cursor="pointer"
                fontSize="xs"
                gap="xs"
                key={name}
                onClick={() => toggleEventName(name)}
                opacity={isOff ? 0.4 : 1}
                role="button"
                title={`${name} (${count}) — click to ${isOff ? 'show' : 'hide'}`}
                transition="opacity 0.15s"
                userSelect="none"
              >
                <Box
                  bg={isOff ? 'transparent' : style.color}
                  border={isOff ? '1.5px solid' : 'none'}
                  borderColor={style.color}
                  borderRadius="full"
                  flexShrink={0}
                  h="8px"
                  w="8px"
                />
                <Text
                  color="font.primary"
                  fontWeight="500"
                  textDecoration={isOff ? 'line-through' : 'none'}
                >
                  {style.legendLabel}
                </Text>
                <Text fontFamily="mono" fontSize="2xs" opacity={0.7}>
                  ×{count}
                </Text>
              </Flex>
            )
          })}
          {disabled.size > 0 && (
            <Button onClick={resetEventNames} size="xs" variant="ghost">
              Reset
            </Button>
          )}
        </Flex>
      )}
      {/* Fixed height on narrow viewports; on md+ this Box grows to fill
          whatever vertical room is left in the bento right-column after
          the legend. `minH={0}` is the magic incantation that lets a
          flex child shrink below its content's intrinsic height — without
          it ECharts' canvas would push the parent. */}
      <Box flex={{ md: '1' }} h={{ base: '320px', md: 'auto' }} minH={{ md: 0 }}>
        <ReactECharts
          notMerge
          option={option}
          opts={{ renderer: 'canvas' }}
          ref={instance => {
            // ReactECharts' ref is typed loosely upstream — cast through
            // `unknown` to the narrow shape the cursor effect expects.
            chartRef.current = (instance as unknown as {
              getEchartsInstance: () => ECharts
            }) ?? null
          }}
          style={{ height: '100%', width: '100%', cursor: onCursorClick ? 'crosshair' : 'default' }}
        />
      </Box>
    </Box>
  )
}
