'use client'

import {
  Box,
  Card,
  Divider,
  Flex,
  HStack,
  Heading,
  Skeleton,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useMemo, useState } from 'react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { useTvlSeries, type MetricKey, type Range } from '@analytics/lib/hooks/useTvlSeries'
import { DeltaPill } from './DeltaPill'

const usdCompact = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n || 0)

const numCompact = (n: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0)

const usdFull = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n || 0)

const numFull = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n || 0)

const dateLabelFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const dateLabelLongFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const hourLabelFmt = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: false,
})
const tooltipDateFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const tooltipHourFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: false,
})

const SERIES_COLORS = {
  v2: '#9f95f0',
  v3: '#E6C6A0',
  cow: '#25e2a4',
} as const

const SERIES_LABEL = {
  v2: 'Balancer v2',
  v3: 'Balancer v3',
  cow: 'CoW AMM',
} as const

const HOVER_COLOR = '#ec4899'

/**
 * Convert a `#rrggbb` hex to `rgba(r,g,b,a)`. Used to derive translucent
 * gradient stops from the solid series palette without hard-coding rgba
 * triplets next to each color.
 */
function rgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function verticalGradient(top: string, bottom: string) {
  return {
    type: 'linear' as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: top },
      { offset: 1, color: bottom },
    ],
  }
}

type MetricDef = {
  key: MetricKey
  label: string
  group: string
  unit: 'USD' | 'COUNT'
  headline: string
  color: string
}

const METRICS: MetricDef[] = [
  { key: 'TVL', label: 'TVL', group: 'Liquidity', unit: 'USD', headline: 'Total value locked', color: '#E6C6A0' },
  { key: 'VOLUME', label: 'Volume', group: 'Activity', unit: 'USD', headline: 'Swap volume · 24h', color: '#EA9A43' },
  { key: 'FEES', label: 'Swap fees', group: 'Revenue', unit: 'USD', headline: 'Swap fees · 24h', color: '#56c596' },
  { key: 'YIELD', label: 'Yield', group: 'Revenue', unit: 'USD', headline: 'Yield captured · 24h', color: '#b3aef5' },
  { key: 'SURPLUS', label: 'CoW surplus', group: 'Revenue', unit: 'USD', headline: 'CoW AMM surplus · 24h', color: '#9f95f0' },
  { key: 'LPS', label: 'LPs', group: 'Participation', unit: 'COUNT', headline: 'Liquidity providers', color: '#25e2a4' },
  { key: 'POOLS', label: 'Pools', group: 'Participation', unit: 'COUNT', headline: 'Active pools', color: '#E6C6A0' },
]

function fmt(value: number, unit: 'USD' | 'COUNT', { full = false }: { full?: boolean } = {}) {
  if (unit === 'USD') return full ? usdFull(value) : usdCompact(value)
  return full ? numFull(value) : numCompact(value)
}

/**
 * Collapse hourly rolling-window samples down to one point per UTC day,
 * picking the latest reading inside each day. The cron writes hourly rows
 * for `*24h` metrics — those are rolling 24h windows sampled every hour, so
 * 24 consecutive points represent the same flow and bar charts cluster into
 * an unreadable wall. One-per-day matches the older defillama backfill
 * cadence and gives bars a sensible width.
 */
function downsampleDaily<T extends { t: number }>(points: T[]): T[] {
  if (points.length === 0) return points
  const byDay = new Map<string, T>()
  for (const p of points) {
    const d = new Date(p.t)
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
    byDay.set(key, p) // last write wins → latest sample of the day
  }
  return Array.from(byDay.values()).sort((a, b) => a.t - b.t)
}

export function TvlOverviewChart() {
  const [metric, setMetric] = useState<MetricKey>('TVL')
  const [range, setRange] = useState<Range>('90D')
  const active = METRICS.find(m => m.key === metric)!
  const { data, loading } = useTvlSeries({ range, mode: metric })

  // When the range spans multiple years, axis labels include the year.
  const showYearInAxis = useMemo(() => {
    if (!data?.points.length) return false
    const first = data.points[0].t
    const last = data.points.at(-1)!.t
    return new Date(first).getUTCFullYear() !== new Date(last).getUTCFullYear()
  }, [data])

  const option = useMemo(() => {
    if (!data) return null
    const pts = data.points
    const isIntraday = range === '24H'
    const fmtAxis = (val: number) =>
      isIntraday
        ? hourLabelFmt.format(new Date(val))
        : (showYearInAxis ? dateLabelLongFmt : dateLabelFmt).format(new Date(val))
    const fmtTooltipDate = (val: number) =>
      isIntraday
        ? tooltipHourFmt.format(new Date(val))
        : tooltipDateFmt.format(new Date(val))

    // Chart shape per metric:
    //  - TVL          → stacked area (a stock — v2/v3/cow composition matters)
    //  - VOLUME       → stacked bars, one per day (daily flow)
    //  - FEES/YIELD/SURPLUS → single-series daily bars (flows)
    //  - LPS/POOLS    → single-series area (cumulative-ish counts)
    //
    // On the 24H range we revert flow metrics to a thin line: the underlying
    // value is a rolling 24h window sampled hourly, so "one bar per hour"
    // would show 24 near-identical overlapping windows — misleading and ugly.
    const isFlowMetric =
      metric === 'VOLUME' || metric === 'FEES' || metric === 'YIELD' || metric === 'SURPLUS'
    const isBar = isFlowMetric && !isIntraday
    // Bars are one-per-day across all non-24H ranges (the cron writes hourly
    // rolling windows; daily downsample undoes that without dropping history).
    const barPts = isBar ? downsampleDaily(pts) : pts

    const baseAxis = {
      xAxis: {
        type: 'time' as const,
        axisLine: { lineStyle: { color: 'rgba(229,211,190,0.06)' } },
        axisLabel: {
          color: '#718096',
          fontSize: 10,
          hideOverlap: true,
          formatter: fmtAxis,
        },
      },
      yAxis: {
        type: 'value' as const,
        position: 'right' as const,
        splitLine: { lineStyle: { color: 'rgba(229,211,190,0.05)', type: 'dashed' as const } },
        axisLabel: {
          color: '#718096',
          fontSize: 10,
          formatter: (v: number) => fmt(v, active.unit),
        },
      },
    }

    if (data.stacked) {
      const mkArea = (key: 'v2' | 'v3' | 'cow') => ({
        name: SERIES_LABEL[key],
        type: 'line' as const,
        stack: 'protocol',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 1.5, color: SERIES_COLORS[key] },
        itemStyle: { color: SERIES_COLORS[key] },
        areaStyle: {
          color: verticalGradient(
            rgba(SERIES_COLORS[key], 0.55),
            rgba(SERIES_COLORS[key], 0.05)
          ),
        },
        emphasis: { focus: 'series' as const },
        data: pts.map(p => [p.t, p[key]]),
      })

      const mkBar = (key: 'v2' | 'v3' | 'cow', isTop: boolean) => ({
        name: SERIES_LABEL[key],
        type: 'bar' as const,
        stack: 'protocol',
        // No barMaxWidth — ECharts auto-sizes bars from data density on the
        // time axis. Capping it (we tried 22px) leaves big white gaps when
        // points are sparse. Matches frontend-v3 PoolCharts.
        itemStyle: {
          color: verticalGradient(rgba(SERIES_COLORS[key], 1), rgba(SERIES_COLORS[key], 0.45)),
          // Top series gets a pill-rounded top edge; inner stack segments stay
          // flat so they don't open thin gaps where their corners would round.
          borderRadius: isTop ? [100, 100, 0, 0] : 0,
        },
        emphasis: {
          focus: 'series' as const,
          itemStyle: { color: HOVER_COLOR },
        },
        data: barPts.map(p => [p.t, p[key]]),
      })

      const series = isBar
        ? [mkBar('v2', false), mkBar('v3', false), mkBar('cow', true)]
        : [mkArea('v2'), mkArea('v3'), mkArea('cow')]

      return {
        grid: { left: 8, right: 56, top: 12, bottom: 24 },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: isBar ? ('shadow' as const) : ('line' as const) },
          backgroundColor: '#383E47',
          borderColor: 'rgba(229,211,190,0.08)',
          textStyle: { color: '#E5D3BE' },
          formatter: (params: any) => {
            if (!Array.isArray(params) || !params.length) return ''
            const ts = params[0].value?.[0] ?? params[0].axisValue
            const date = fmtTooltipDate(ts)
            const rows = params
              .slice()
              .reverse()
              .map(p => {
                const v = Array.isArray(p.value) ? Number(p.value[1]) : Number(p.value)
                return `
                  <div style="display:flex;align-items:center;gap:8px;margin-top:2px">
                    <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${SERIES_COLORS[(p.seriesName === SERIES_LABEL.v2 ? 'v2' : p.seriesName === SERIES_LABEL.v3 ? 'v3' : 'cow')]}"></span>
                    <span style="flex:1;color:#A0AEC0">${p.seriesName}</span>
                    <span style="font-weight:600">${fmt(v, active.unit)}</span>
                  </div>`
              })
              .join('')
            const total = params.reduce((acc: number, p: any) => {
              const v = Array.isArray(p.value) ? Number(p.value[1]) : Number(p.value)
              return acc + (Number.isFinite(v) ? v : 0)
            }, 0)
            return `
              <div style="min-width:200px">
                <div style="color:#E5D3BE;font-weight:600;margin-bottom:4px">${date}</div>
                ${rows}
                <div style="display:flex;justify-content:space-between;margin-top:6px;padding-top:6px;border-top:1px solid rgba(229,211,190,0.12)">
                  <span style="color:#A0AEC0">Total</span>
                  <span style="font-weight:700">${fmt(total, active.unit)}</span>
                </div>
              </div>`
          },
        },
        legend: { show: false },
        ...baseAxis,
        series,
      }
    }

    // Single-series — bars for flow metrics (fees/yield/surplus), area for
    // count metrics (LPs, pools).
    const singleSeries = isBar
      ? {
          name: active.label,
          type: 'bar' as const,
          // No barMaxWidth — let ECharts auto-size by data density.
          itemStyle: {
            color: verticalGradient(rgba(active.color, 1), rgba(active.color, 0.3)),
            borderRadius: [100, 100, 0, 0],
          },
          emphasis: { itemStyle: { color: HOVER_COLOR } },
          data: barPts.map(p => [p.t, p.value]),
        }
      : {
          name: active.label,
          type: 'line' as const,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: active.color },
          areaStyle: {
            color: verticalGradient(rgba(active.color, 0.6), rgba(active.color, 0)),
          },
          data: pts.map(p => [p.t, p.value]),
        }

    return {
      grid: { left: 8, right: 56, top: 12, bottom: 24 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: isBar ? ('shadow' as const) : ('line' as const) },
        backgroundColor: '#383E47',
        borderColor: 'rgba(229,211,190,0.08)',
        textStyle: { color: '#E5D3BE' },
        formatter: (params: any) => {
          if (!Array.isArray(params) || !params.length) return ''
          const ts = params[0].value?.[0] ?? params[0].axisValue
          const date = tooltipDateFmt.format(new Date(ts))
          const v = Array.isArray(params[0].value)
            ? Number(params[0].value[1])
            : Number(params[0].value)
          return `
            <div style="min-width:180px">
              <div style="color:#E5D3BE;font-weight:600;margin-bottom:4px">${date}</div>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${active.color}"></span>
                <span style="flex:1;color:#A0AEC0">${active.label}</span>
                <span style="font-weight:700">${fmt(v, active.unit, { full: active.unit === 'COUNT' })}</span>
              </div>
            </div>`
        },
      },
      ...baseAxis,
      series: [singleSeries],
    }
  }, [data, showYearInAxis, active, range, metric])

  const latest = data?.points.at(-1)
  const totalNow = latest?.value ?? 0
  const hasAnyData = !!data && data.realPointCount > 0
  const canPlot = !!data && data.realPointCount >= 2
  const headlineValue = hasAnyData
    ? fmt(totalNow, active.unit, { full: active.unit === 'COUNT' })
    : '—'
  const firstDataLabel =
    data?.firstDataAt != null
      ? new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date(data.firstDataAt))
      : null

  return (
    <Card overflow="hidden" position="relative" variant="level1">
      <VStack align="stretch" spacing="md">
        <Flex align="flex-start" flexWrap="wrap" gap="ms" justify="space-between">
          <VStack align="flex-start" spacing="xs">
            <Heading size="h5">Protocol metrics</Heading>
            <Text color="font.secondary" fontSize="xs">
              Browse historical data
            </Text>
          </VStack>
          <SegBtns
            onChange={setRange}
            options={['24H', '7D', '30D', '90D', '1Y', 'ALL']}
            value={range}
          />
        </Flex>

        <MetricTabs metric={metric} onChange={setMetric} />

        <Stack
          align="stretch"
          direction={{ base: 'column', lg: 'row' }}
          spacing="md"
        >
          {/* Bento sidebar – stats */}
          <Card
            flexShrink={0}
            variant="subSection"
            w={{ base: 'full', lg: '280px' }}
          >
            <VStack align="stretch" h="full" p="md" spacing="md">
              <Box>
                <Text
                  color="font.secondary"
                  fontSize="xs"
                  fontWeight="medium"
                  letterSpacing="0.4px"
                  textTransform="uppercase"
                >
                  {active.headline}
                </Text>
                <HStack align="baseline" mt="xs" spacing="sm">
                  <Heading
                    color="font.maxContrast"
                    letterSpacing="-0.8px"
                    size="h2"
                  >
                    {headlineValue}
                  </Heading>
                </HStack>
                <HStack mt="xs" spacing="sm">
                  {data?.change24h != null ? (
                    <>
                      <DeltaPill value={data.change24h} />
                      <Text color="font.secondary" fontSize="xs">
                        vs previous {range === '24H' ? 'hour' : '24h'}
                      </Text>
                    </>
                  ) : (
                    <Text color="font.secondary" fontSize="xs">
                      {hasAnyData ? 'change unavailable' : 'No data captured yet'}
                    </Text>
                  )}
                </HStack>
                {data?.sparse && firstDataLabel && (
                  <Text color="font.secondary" fontSize="2xs" mt="xs">
                    Indexed since {firstDataLabel}
                  </Text>
                )}
              </Box>

              {data?.stacked ? (
                <>
                  <Divider />
                  <VStack align="stretch" spacing="sm">
                    <Text
                      color="font.secondary"
                      fontSize="xs"
                      fontWeight="medium"
                      letterSpacing="0.4px"
                      textTransform="uppercase"
                    >
                      By protocol
                    </Text>
                    <BreakdownRow
                      color={SERIES_COLORS.v3}
                      label={SERIES_LABEL.v3}
                      total={totalNow}
                      unit={active.unit}
                      value={latest?.v3 ?? 0}
                    />
                    <BreakdownRow
                      color={SERIES_COLORS.v2}
                      label={SERIES_LABEL.v2}
                      total={totalNow}
                      unit={active.unit}
                      value={latest?.v2 ?? 0}
                    />
                    <BreakdownRow
                      color={SERIES_COLORS.cow}
                      label={SERIES_LABEL.cow}
                      total={totalNow}
                      unit={active.unit}
                      value={latest?.cow ?? 0}
                    />
                  </VStack>
                </>
              ) : (
                <>
                  <Divider />
                  <VStack align="stretch" spacing="xs">
                    <Text
                      color="font.secondary"
                      fontSize="xs"
                      fontWeight="medium"
                      letterSpacing="0.4px"
                      textTransform="uppercase"
                    >
                      Range
                    </Text>
                    <RangeStat data={data} unit={active.unit} />
                  </VStack>
                </>
              )}
            </VStack>
          </Card>

          {/* Bento main – chart, wrapped in NoisyCard for the frontend-v3
              "soft bento" treatment (noise texture, inner shadow, hover
              radial gradient). */}
          <Box
            // Two-axis problem:
            //  - ECharts asks `height: 100%`, so the parent must have an
            //    explicit `h` (not just `minH`) — without it the canvas
            //    resolves to 0 and the chart collapses to ~content height
            //    (the original 372px symptom).
            //  - Below `lg` the Stack is column-direction. `flex: 1` then
            //    sets `flex-basis: 0` on the main axis (height), which
            //    overrides our `h` and re-collapses the chart. So `flex` is
            //    disabled in column mode; we only enable it at `lg+` where
            //    the Stack is row and `flex: 1` correctly fills the
            //    remaining horizontal space.
            flex={{ base: 'none', lg: 1 }}
            h={{ base: '360px', lg: '420px' }}
            minW={0}
            position="relative"
            w="full"
          >
            <NoisyCard
              cardProps={{ height: 'full', overflow: 'hidden' }}
              contentProps={{ display: 'flex', flexDirection: 'column', height: 'full', p: 'sm' }}
            >
              <Box flex={1} minH={0} w="full">
                {loading ? (
                  <Skeleton h="full" w="full" />
                ) : !canPlot ? (
                  <SparseDataPlaceholder
                    active={active}
                    firstDataLabel={firstDataLabel}
                    hasAnyData={hasAnyData}
                    range={range}
                    realPointCount={data?.realPointCount ?? 0}
                    value={hasAnyData ? headlineValue : null}
                  />
                ) : (
                  // `notMerge` + a shape-aware key force ECharts to drop the
                  // previous option fully when switching metric type —
                  // otherwise the stacked TVL series persists underneath a
                  // single-line chart like Fees / Yield and looks like wrong
                  // data.
                  <ReactECharts
                    key={`${data?.stacked ? 's' : '1'}-${metric}`}
                    notMerge
                    option={option!}
                    style={{ height: '100%', width: '100%' }}
                  />
                )}
              </Box>
            </NoisyCard>
          </Box>
        </Stack>
      </VStack>
    </Card>
  )
}

function BreakdownRow({
  color,
  label,
  value,
  total,
  unit,
}: {
  color: string
  label: string
  value: number
  total: number
  unit: 'USD' | 'COUNT'
}) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <Flex align="center" gap="sm">
      <Box bg={color} borderRadius="2px" flexShrink={0} h="8px" w="8px" />
      <Text color="font.secondary" flex={1} fontSize="sm">
        {label}
      </Text>
      <VStack align="flex-end" spacing={0}>
        <Text fontSize="sm" fontWeight="medium">
          {fmt(value, unit)}
        </Text>
        <Text color="font.secondary" fontSize="2xs">
          {pct.toFixed(1)}%
        </Text>
      </VStack>
    </Flex>
  )
}

function RangeStat({
  data,
  unit,
}: {
  data: { points: { value: number }[] } | null
  unit: 'USD' | 'COUNT'
}) {
  if (!data?.points.length) return null
  // Drop zero/non-finite values so sparse metrics (1-2 real days surrounded by
  // backfill blanks) don't report `Low: 0` and a misleading deflated `Avg`.
  const values = data.points.map(p => p.value).filter(v => Number.isFinite(v) && v > 0)
  if (!values.length) {
    return (
      <Text color="font.secondary" fontSize="xs">
        Not enough data yet.
      </Text>
    )
  }
  const max = Math.max(...values)
  const min = Math.min(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return (
    <VStack align="stretch" spacing="xs">
      <RangeRow label="High" unit={unit} value={max} />
      <RangeRow label="Low" unit={unit} value={min} />
      <RangeRow label="Avg" unit={unit} value={avg} />
    </VStack>
  )
}

function SparseDataPlaceholder({
  active,
  firstDataLabel,
  hasAnyData,
  range,
  realPointCount,
  value,
}: {
  active: MetricDef
  firstDataLabel: string | null
  hasAnyData: boolean
  range: Range
  realPointCount: number
  value: string | null
}) {
  return (
    <VStack align="center" h="full" justify="center" px="md" spacing="sm" textAlign="center">
      <Box
        bg={`${active.color}22`}
        borderRadius="full"
        color={active.color}
        fontSize="xs"
        fontWeight="medium"
        letterSpacing="0.4px"
        px="sm"
        py="2px"
        textTransform="uppercase"
      >
        {active.label}
      </Box>
      <Heading color="font.maxContrast" letterSpacing="-0.6px" size="h3">
        {hasAnyData ? value : '—'}
      </Heading>
      <Text color="font.secondary" fontSize="sm" maxW="320px">
        {hasAnyData
          ? `Only ${realPointCount} data point${realPointCount === 1 ? '' : 's'} indexed so far — not enough history to plot the ${range} chart.`
          : `${active.label} hasn't been captured in the selected range yet.`}
      </Text>
      {firstDataLabel && (
        <Text color="font.secondary" fontSize="xs">
          First captured on {firstDataLabel}
        </Text>
      )}
    </VStack>
  )
}

function RangeRow({
  label,
  value,
  unit,
}: {
  label: string
  value: number
  unit: 'USD' | 'COUNT'
}) {
  return (
    <Flex align="baseline" justify="space-between">
      <Text color="font.secondary" fontSize="xs">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="medium">
        {fmt(value, unit)}
      </Text>
    </Flex>
  )
}

function MetricTabs({ metric, onChange }: { metric: MetricKey; onChange: (m: MetricKey) => void }) {
  return (
    <VStack align="flex-start" spacing="xs">
      <Text color="font.secondary" fontSize="2xs" fontWeight="medium" letterSpacing="0.4px" textTransform="uppercase">
        Switch metric
      </Text>
      <HStack
        alignSelf="flex-start"
        bg="background.level0"
        border="1px solid"
        borderColor="border.subduedZen"
        borderRadius="full"
        flexWrap="wrap"
        maxW="full"
        p="3px"
        role="tablist"
        spacing="2px"
        w="fit-content"
      >
        {METRICS.map(m => {
          const isActive = metric === m.key
          return (
            <Box
              _hover={
                isActive
                  ? undefined
                  : {
                      color: 'font.maxContrast',
                      bg: 'background.level2',
                    }
              }
              aria-selected={isActive}
              as="button"
              bg={isActive ? 'background.level3' : 'transparent'}
              boxShadow={isActive ? 'sm' : 'none'}
              color={isActive ? 'font.maxContrast' : 'font.secondary'}
              cursor="pointer"
              fontSize="xs"
              fontWeight={isActive ? 'bold' : 'medium'}
              key={m.key}
              onClick={() => onChange(m.key)}
              px="ms"
              py="xs"
              role="tab"
              rounded="full"
              transition="all 0.15s"
              type="button"
            >
              {m.label}
            </Box>
          )
        })}
      </HStack>
    </VStack>
  )
}

function SegBtns<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <HStack
      bg="background.level0"
      border="1px solid"
      borderColor="border.subduedZen"
      borderRadius="full"
      p="3px"
      role="tablist"
      spacing={0}
    >
      {options.map(o => {
        const isActive = value === o
        return (
          <Box
            _hover={
              isActive
                ? undefined
                : {
                    color: 'font.maxContrast',
                    bg: 'background.level2',
                  }
            }
            aria-selected={isActive}
            as="button"
            bg={isActive ? 'background.level3' : 'transparent'}
            boxShadow={isActive ? 'sm' : 'none'}
            color={isActive ? 'font.maxContrast' : 'font.secondary'}
            cursor="pointer"
            fontSize="xs"
            fontWeight={isActive ? 'bold' : 'medium'}
            key={o}
            onClick={() => onChange(o)}
            px="ms"
            py="xs"
            role="tab"
            rounded="full"
            transition="all 0.15s"
            type="button"
          >
            {o}
          </Box>
        )
      })}
    </HStack>
  )
}
