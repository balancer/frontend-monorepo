'use client'

/**
 * AutoRange history card — sampled bounds + spot over the chart's active
 * range, plus a centeredness sparkline.
 *
 * This is a separate visualization, intentionally NOT layered on top of
 * the main TVL/Volume/Fees chart — the bounds question ("where did the
 * green band move?") is qualitatively different from the flow question
 * ("how much volume routed through?"), and overlaying them would force
 * the operator to mentally untangle two y-axes for no gain.
 *
 * Data path: see `useAutoRangeHistory` (client hook) and the matching
 * `/api/pool/[chain]/[id]/autorange-history` route (server-side archive
 * sampler).
 */

import { Box, Card, Flex, HStack, Heading, Spinner, Text, VStack } from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import type { GqlChainValues } from '@repo/lib/config/networks'
import {
  useAutoRangeHistory,
  type AutoRangeHistoryRange,
} from '@analytics/lib/hooks/useAutoRangeHistory'
import type { AutoRangeHistoryPoint } from '@analytics/lib/pool-state/autorange-history'

type Props = {
  chain: GqlChainValues
  poolId: string
  range: AutoRangeHistoryRange
  /** Symbol-pair label, e.g. "DUST / USDC". Plumbed in from the page so
   *  the chart's y-axis caption matches what the live AutoRange card
   *  shows for the same pool. */
  pairLabel: string
  /** Centeredness margin threshold (0–1, e.g. 0.10 for 10%). The
   *  centeredness sparkline references it as a horizontal threshold —
   *  dipping below means the pool will start drifting bounds. */
  centerednessMarginFraction: number
}

const RANGE_LABEL: Record<AutoRangeHistoryRange, string> = {
  '30d': '30d',
  '90d': '90d',
  '180d': '180d',
  '1y': '1y',
  all: 'all-time',
}

const priceFmt = (n: number): string => {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, { maximumSignificantDigits: 4 })
}

const pctFmt = (n: number): string => {
  if (!Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(1)}%`
}

// ── Chart palette — tuned against the existing card background so the
// bands sit visibly without overpowering the spot line. Kept central so
// the legend chips and the ECharts series read the same colors.
//
// Bands and target use the same orange.300 (#fdba74) / green.300 (#63f2be)
// hues as the live AutoRange distribution bar in PoolStatePanel and the
// frontend-v3 reCLAMM barometer chart. The "gradient" effect inside each
// zone is produced by stacking N thin sub-bands with bell-curve / linear
// alpha distributions across them — see `buildSubBandSeries` below for
// the rationale.
const COLORS = {
  // Hue strings for the alpha-modulated sub-bands. Same RGB as the
  // frontend-v3 reCLAMM chart (`ReclAmmChartProvider.tsx`).
  marginRgb: '253, 186, 116', // chakra orange.300
  targetRgb: '99, 242, 190', // chakra green.300
  // Legend swatch + tooltip dot colors (single representative tone per band)
  marginBandEdge: 'rgba(249, 115, 22, 0.70)', // chakra orange.500
  targetBandEdge: 'rgba(99, 242, 190, 0.70)',
  spot: '#2dd4bf', // chakra teal.400 — clearly distinct from the green band
  spotGlow: 'rgba(45, 212, 191, 0.85)', // matches spot, used for the line halo
  centeredness: '#c4b5fd', // chakra purple.300
  centerednessFill: 'rgba(196, 181, 253, 0.18)',
  marginThreshold: 'rgba(248, 113, 113, 0.7)', // chakra red.400 — danger line
  driftZoneFill: 'rgba(248, 113, 113, 0.10)', // red.400 @10% — drift area
  driftZoneLabel: 'rgba(252, 165, 165, 0.85)', // red.300 — readable on the fill
  axisText: '#9aa3b2',
  axisLine: 'rgba(255, 255, 255, 0.08)',
  splitLine: 'rgba(255, 255, 255, 0.06)',
  tooltipBg: 'rgba(20, 22, 30, 0.92)',
  tooltipBorder: 'rgba(255, 255, 255, 0.06)',
  tooltipText: '#e5e7eb',
} as const

// ── Sub-band tick math ─────────────────────────────────────────────────
//
// Frontend-v3's reCLAMM chart (`ReclAmmChartProvider`) uses a fixed
// 52-tick palette for the in-range region (margin + target + margin) and
// derives the orange/green split from the pool's centeredness margin %.
// Porting the same math here means the history chart's sub-band density
// MATCHES the live barometer for the same pool: 10% margin → 2 / 48 / 2,
// 20% margin → 5 / 42 / 5, <4% margin pins the orange "pinstripe" at 1
// tick per side. Each sub-band's per-x height = (band height) / N, so
// the stack warps with the band geometry — a static areaStyle gradient
// can't do that because ECharts maps gradient coords to the static
// bounding box of the filled shape.
const TOTAL_INRANGE_TICKS = 52

function deriveSubBandCounts(marginFraction: number): {
  orangeCount: number
  greenCount: number
} {
  const marginPct = Math.max(0, Math.min(100, marginFraction * 100))
  const orangeCount =
    marginPct < 4 ? 1 : Math.floor((TOTAL_INRANGE_TICKS * marginPct) / 100 / 2)
  const greenCount = TOTAL_INRANGE_TICKS - 2 * orangeCount
  return { orangeCount, greenCount }
}

// Alpha envelopes — produce a per-sub-band alpha given the index and the
// total sub-band count. Domain notes:
// - Target: cosine bell, peaks at center (geometric midline of the band).
// - Margin: linear ramp toward the OUTER edge so the brightest stripe sits
//   adjacent to `min` (lower band) / `max` (upper band) — same intuition
//   as the live state bar, where the bounds edge reads as the "hot" zone.
const TARGET_ALPHA_PEAK = 0.55
const TARGET_ALPHA_FLOOR = 0.05
const MARGIN_ALPHA_PEAK = 0.55
const MARGIN_ALPHA_FLOOR = 0.1

function targetAlpha(i: number, n: number): number {
  if (n <= 1) return TARGET_ALPHA_PEAK
  const t = (i + 0.5) / n // fractional center, (0, 1)
  const distFromCenter = Math.abs(t - 0.5) * 2 // 0 at center, 1 at edges
  const weight = Math.cos((distFromCenter * Math.PI) / 2) // cos bell
  return TARGET_ALPHA_FLOOR + (TARGET_ALPHA_PEAK - TARGET_ALPHA_FLOOR) * weight
}

/** Lower margin: sub-band 0 sits adjacent to `min` (outer, hot); sub-band
 *  N-1 sits adjacent to the green target (inner, soft). */
function lowerMarginAlpha(i: number, n: number): number {
  if (n <= 1) return (MARGIN_ALPHA_PEAK + MARGIN_ALPHA_FLOOR) / 2
  const t = (i + 0.5) / n
  return MARGIN_ALPHA_PEAK - (MARGIN_ALPHA_PEAK - MARGIN_ALPHA_FLOOR) * t
}

/** Upper margin: sub-band 0 sits adjacent to the green target (inner,
 *  soft); sub-band N-1 sits adjacent to `max` (outer, hot). Mirror of
 *  lowerMarginAlpha so both margin zones burn the same color outward. */
function upperMarginAlpha(i: number, n: number): number {
  if (n <= 1) return (MARGIN_ALPHA_PEAK + MARGIN_ALPHA_FLOOR) / 2
  const t = (i + 0.5) / n
  return MARGIN_ALPHA_FLOOR + (MARGIN_ALPHA_PEAK - MARGIN_ALPHA_FLOOR) * t
}

/** Build N stacked thin sub-bands that together fill `bandHeights`. Each
 *  sub-band's per-x height = bandHeights[x] / N, so the stack tracks the
 *  actual upper/lower curves of the band. Alpha across the stack is
 *  driven by the supplied envelope function. */
function buildSubBandSeries(
  count: number,
  bandHeights: (number | null)[],
  x: number[],
  alphaFor: (i: number, n: number) => number,
  colorRgb: string,
  namePrefix: string
) {
  if (count <= 0) return []
  return Array.from({ length: count }, (_, i) => {
    const alpha = alphaFor(i, count)
    return {
      name: `_${namePrefix}_${i}`,
      type: 'line' as const,
      xAxisIndex: 0,
      yAxisIndex: 0,
      stack: 'bounds',
      symbol: 'none',
      showSymbol: false,
      lineStyle: { opacity: 0 },
      areaStyle: { color: `rgba(${colorRgb}, ${alpha})` },
      data: x.map((t, idx) => [
        t,
        bandHeights[idx] === null ? null : (bandHeights[idx] as number) / count,
      ]),
    }
  })
}

/** Compact "Mar 5" / "Mar 5 '25" date formatter for the bottom x-axis. */
function fmtDateShort(ms: number): string {
  const d = new Date(ms)
  const now = new Date()
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: '2-digit' }),
  })
}

/**
 * Build ECharts option object. The bounds region is rendered as a stack
 * of thin sub-band line series with `areaStyle` so the filled deltas
 * compose into [orange margin | green target | orange margin]. Each
 * zone's sub-band count is derived from the pool's centeredness margin
 * % (`deriveSubBandCounts`) so the sub-band density matches the live
 * frontend-v3 reCLAMM barometer. Alpha across the sub-bands is shaped by
 * `targetAlpha` / `lowerMarginAlpha` / `upperMarginAlpha`. The spot line
 * sits above the stack with a `shadowBlur` glow so it stays legible on
 * the variegated background.
 *
 * `connectNulls: false` so a NaN sample (failed archive read for that
 * block) produces a visible gap rather than interpolating across — the
 * operator should see when the data is missing, not pretend continuity.
 */
function buildChartOption(
  samples: readonly AutoRangeHistoryPoint[],
  pairLabel: string,
  centerednessMarginFraction: number
) {
  // ECharts time axis wants Date objects (or ms timestamps). Snapshots
  // come in unix seconds.
  const x = samples.map(s => s.timestamp * 1000)
  const min = samples.map(s => (Number.isFinite(s.minPrice) ? s.minPrice : null))
  const max = samples.map(s => (Number.isFinite(s.maxPrice) ? s.maxPrice : null))
  const lowT = samples.map(s =>
    Number.isFinite(s.lowTargetPrice) ? s.lowTargetPrice : null
  )
  const highT = samples.map(s =>
    Number.isFinite(s.highTargetPrice) ? s.highTargetPrice : null
  )
  const spot = samples.map(s => (Number.isFinite(s.spotPrice) ? s.spotPrice : null))
  const centerednessPct = samples.map(s =>
    Number.isFinite(s.centeredness) ? s.centeredness * 100 : null
  )
  const marginPctLine = centerednessMarginFraction * 100

  // Stacked-band deltas. Each delta is `next - prev`; if either is null
  // the whole stack column drops out (intentional — partial bounds are
  // worse than no bounds at that x position).
  const deltaOrNull = (
    series: (number | null)[],
    floor: (number | null)[]
  ): (number | null)[] =>
    series.map((v, i) => {
      const f = floor[i]
      if (v === null || f === null) return null
      const d = v - f
      return d >= 0 ? d : 0
    })
  const lowMinusMin = deltaOrNull(lowT, min)
  const highMinusLow = deltaOrNull(highT, lowT)
  const maxMinusHigh = deltaOrNull(max, highT)

  // Sub-band tick density mirrors the frontend-v3 reCLAMM barometer for
  // this pool (`ReclAmmChartProvider`: 52 in-range ticks split by margin%).
  const { orangeCount, greenCount } = deriveSubBandCounts(centerednessMarginFraction)
  const lowerMarginBands = buildSubBandSeries(
    orangeCount,
    lowMinusMin,
    x,
    lowerMarginAlpha,
    COLORS.marginRgb,
    'margin-low'
  )
  const targetBands = buildSubBandSeries(
    greenCount,
    highMinusLow,
    x,
    targetAlpha,
    COLORS.targetRgb,
    'target'
  )
  const upperMarginBands = buildSubBandSeries(
    orangeCount,
    maxMinusHigh,
    x,
    upperMarginAlpha,
    COLORS.marginRgb,
    'margin-high'
  )

  return {
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        lineStyle: { color: COLORS.axisText, opacity: 0.4, type: 'dashed', width: 1 },
        crossStyle: { color: COLORS.axisText, opacity: 0.4 },
        label: { backgroundColor: COLORS.tooltipBg, color: COLORS.tooltipText },
      },
      backgroundColor: COLORS.tooltipBg,
      borderColor: COLORS.tooltipBorder,
      borderWidth: 1,
      padding: 10,
      textStyle: { color: COLORS.tooltipText, fontSize: 12, lineHeight: 18 },
      extraCssText: 'border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,0.35);',
      formatter: (params: { dataIndex: number }[]) => {
        const i = params[0]?.dataIndex
        if (i === undefined) return ''
        const ts = new Date(samples[i].timestamp * 1000)
        const date = ts.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
        const dot = (color: string) =>
          `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px;vertical-align:middle"></span>`
        const row = (label: string, value: string, color?: string) =>
          `<div style="display:flex;justify-content:space-between;gap:18px;padding:1px 0"><span style="opacity:0.7">${color ? dot(color) : ''}${label}</span><span style="font-family:ui-monospace,monospace">${value}</span></div>`
        return [
          `<div style="font-weight:600;margin-bottom:6px">${date}</div>`,
          row('Max', priceFmt(samples[i].maxPrice), COLORS.marginBandEdge),
          row('High target', priceFmt(samples[i].highTargetPrice), COLORS.targetBandEdge),
          row('Spot', priceFmt(samples[i].spotPrice), COLORS.spot),
          row('Low target', priceFmt(samples[i].lowTargetPrice), COLORS.targetBandEdge),
          row('Min', priceFmt(samples[i].minPrice), COLORS.marginBandEdge),
          `<div style="height:1px;background:${COLORS.tooltipBorder};margin:6px 0"></div>`,
          row('Centeredness', pctFmt(samples[i].centeredness), COLORS.centeredness),
        ].join('')
      },
    },
    // We render our own legend chips in the Card header — ECharts' built-in
    // legend would be redundant and would cost a row of vertical space.
    legend: { show: false },
    // Two grids: top pane for bounds + spot (dominant), bottom for the
    // centeredness sparkline. `containLabel: true` reserves space for the
    // tick LABELS but NOT for the rotated axis `name`. The name sits at
    // canvas X ≈ `grid.left + tickLabelWidth − nameGap`, so to keep the
    // name LEFT of the tick labels we need `nameGap > tickLabelWidth`,
    // and `grid.left` then has to be wide enough that the name doesn't
    // clip the canvas edge. With price ticks like "1.2345" widening to
    // ~45 px, `nameGap: 56` parks the rotated name comfortably left of
    // the labels, and `grid.left: 64` keeps its outer edge inside the
    // canvas. Same `left` on the bottom pane so the x-axis date column
    // aligns vertically with the top pane's price column.
    grid: [
      {
        left: 64,
        right: 16,
        top: 12,
        height: '60%',
        containLabel: true,
      },
      {
        left: 64,
        right: 16,
        bottom: 32,
        height: '22%',
        containLabel: true,
      },
    ],
    axisPointer: { link: [{ xAxisIndex: 'all' }] },
    xAxis: [
      {
        type: 'time',
        gridIndex: 0,
        axisLabel: { show: false },
        axisLine: { lineStyle: { color: COLORS.axisLine } },
        axisTick: { show: false },
        splitLine: { show: false },
      },
      {
        type: 'time',
        gridIndex: 1,
        axisLabel: {
          color: COLORS.axisText,
          fontSize: 11,
          margin: 12,
          formatter: (v: number) => fmtDateShort(v),
          hideOverlap: true,
        },
        axisLine: { lineStyle: { color: COLORS.axisLine } },
        axisTick: { show: false },
        splitLine: { show: false },
      },
    ],
    yAxis: [
      // Top pane — bounds + spot. Axis name = pair label, rotated 90°.
      // `nameGap: 56` is sized to exceed the widest tick label (~45 px
      // for a 4-significant-digit price), so the rotated name sits
      // entirely to the LEFT of the tick column rather than overlapping
      // it. `grid.left: 64` provides the matching canvas margin so the
      // name doesn't clip the chart edge.
      {
        gridIndex: 0,
        type: 'value',
        scale: true,
        name: pairLabel,
        nameLocation: 'middle',
        nameGap: 56,
        nameTextStyle: { color: COLORS.axisText, fontSize: 12, fontWeight: 500 },
        axisLabel: {
          color: COLORS.axisText,
          fontSize: 11,
          formatter: (v: number) => priceFmt(v),
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: COLORS.splitLine } },
      },
      // Bottom pane — centeredness sparkline. No axis `name` here: the
      // rotated "Centeredness" text is ~85 px long but the pane is only
      // ~79 px tall, so a rotated name overlaps both the "100%" top tick
      // and the "0%" bottom tick. The series identity is already carried
      // by the header legend chip (violet line · "Centeredness") and the
      // `%` suffix on tick labels makes the unit self-evident.
      {
        gridIndex: 1,
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          color: COLORS.axisText,
          fontSize: 11,
          // Only label 0 / margin / 100 so the small pane stays uncluttered.
          // Anything in between is visually obvious from the line position
          // alone; the drift zone markArea handles "below margin" framing.
          interval: 0,
          formatter: (v: number) => {
            if (v === 0 || v === 100) return `${v}%`
            if (Math.abs(v - centerednessMarginFraction * 100) < 0.5) return `${v}%`
            return ''
          },
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: COLORS.splitLine } },
      },
    ],
    series: [
      // ── Bounds stack (invisible floor + N orange + N green + N orange) ─
      // The floor at `min` is the invisible baseline; each band above it
      // is a vertical stack of thin sub-bands at fixed fractional positions
      // within the band, so the alpha envelopes (`targetAlpha`, …) warp
      // with the actual band geometry as bounds shift.
      {
        name: '_min-floor',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        stack: 'bounds',
        symbol: 'none',
        lineStyle: { opacity: 0 },
        showSymbol: false,
        data: x.map((t, i) => [t, min[i]]),
      },
      ...lowerMarginBands,
      ...targetBands,
      ...upperMarginBands,
      // ── Spot halo + line ───────────────────────────────────────────
      // Two-pass render: a thicker, low-opacity halo underneath plus a
      // sharp top line, layered with `z` so the halo stays beneath the
      // sharp stroke. ECharts' `shadowBlur` on the line works too but the
      // dual-series approach gives a softer, more uniform glow against
      // the variegated band backdrop without the harsh "outer-glow ring"
      // shadowBlur leaves on sharp inflection points.
      {
        name: '_spot-halo',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: 0.2,
        symbol: 'none',
        showSymbol: false,
        lineStyle: {
          color: COLORS.spotGlow,
          width: 6,
          opacity: 0.45,
          shadowColor: COLORS.spotGlow,
          shadowBlur: 14,
        },
        connectNulls: false,
        z: 6,
        silent: true, // tooltip / hover comes from the sharp series
        data: x.map((t, i) => [t, spot[i]]),
      },
      {
        name: 'Spot',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: 0.2,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,
        emphasis: { focus: 'series', scale: false },
        lineStyle: {
          color: COLORS.spot,
          width: 2,
          shadowColor: COLORS.spotGlow,
          shadowBlur: 6,
        },
        itemStyle: { color: COLORS.spot, borderColor: '#0b0d12', borderWidth: 2 },
        connectNulls: false,
        z: 7,
        data: x.map((t, i) => [t, spot[i]]),
      },
      // ── Centeredness sparkline (bottom pane) ───────────────────────
      // The "drift zone" markArea is the headline visual here — a soft
      // red fill below the configured centeredness margin tells the
      // operator "if the line dips into red, the pool starts shifting
      // bounds to recenter." A thin dashed threshold line marks the
      // boundary itself. No inline text label — the margin % is communicated
      // by the header chip + the lone y-axis tick at that level.
      {
        name: 'Centeredness',
        type: 'line',
        xAxisIndex: 1,
        yAxisIndex: 1,
        smooth: 0.2,
        symbol: 'none',
        showSymbol: false,
        lineStyle: { color: COLORS.centeredness, width: 1.5 },
        areaStyle: { color: COLORS.centerednessFill },
        connectNulls: false,
        markArea: {
          silent: true,
          itemStyle: { color: COLORS.driftZoneFill },
          label: {
            position: 'insideBottomLeft',
            distance: [6, 2],
            color: COLORS.driftZoneLabel,
            fontSize: 10,
            fontWeight: 500,
            formatter: 'drift zone',
          },
          data: [[{ yAxis: 0 }, { yAxis: marginPctLine }]],
        },
        markLine: {
          symbol: ['none', 'none'],
          silent: true,
          lineStyle: { color: COLORS.marginThreshold, type: 'dashed', width: 1 },
          label: { show: false },
          data: [{ yAxis: marginPctLine }],
        },
        data: x.map((t, i) => [t, centerednessPct[i]]),
      },
    ],
  }
}

export function PoolAutoRangeHistory({
  chain,
  poolId,
  range,
  pairLabel,
  centerednessMarginFraction,
}: Props) {
  const { samples, loading, error, loaded } = useAutoRangeHistory(chain, poolId, range)

  const option = useMemo(
    () => buildChartOption(samples, pairLabel, centerednessMarginFraction),
    [samples, pairLabel, centerednessMarginFraction]
  )

  const validSampleCount = samples.filter(s => Number.isFinite(s.minPrice)).length

  const subtitle = (() => {
    if (loading) return 'Sampling archive bounds…'
    if (error) return 'Unable to load history.'
    if (validSampleCount === 0) return 'No archive samples available for this range.'
    return `${validSampleCount} sample${validSampleCount === 1 ? '' : 's'} · ${RANGE_LABEL[range]}`
  })()

  return (
    <FadeInOnView animateOnce={false}>
      <Card overflow="hidden" variant="level1">
        <NoisyCard
          cardProps={{ height: 'full', overflow: 'hidden' }}
          contentProps={{ display: 'flex' }}
        >
          <VStack align="stretch" h="full" p={{ base: 'sm', md: 'md' }} spacing="md" w="full">
            <Flex align="center" justify="space-between">
              <VStack align="flex-start" spacing="xs">
                <Heading size="h5">AutoRange history</Heading>
                <Text color="font.secondary" fontSize="xs">
                  {subtitle}
                </Text>
              </VStack>
              <HStack
                color="font.secondary"
                display={{ base: 'none', md: 'flex' }}
                fontSize="xs"
                spacing="md"
              >
                <LegendChip color={COLORS.targetBandEdge} label="Target range" />
                <LegendChip color={COLORS.marginBandEdge} label="Margin zone" />
                <LegendChip color={COLORS.spot} label="Spot" variant="line" />
                <LegendChip color={COLORS.centeredness} label="Centeredness" variant="line" />
                <LegendChip
                  color="rgba(248, 113, 113, 0.30)"
                  label={`Drift zone <${(centerednessMarginFraction * 100).toFixed(0)}%`}
                />
              </HStack>
            </Flex>

            <Box h={{ base: '360px', md: '420px' }} position="relative" w="full">
              <Body
                error={error}
                loaded={loaded}
                loading={loading}
                option={option}
                validSampleCount={validSampleCount}
              />
            </Box>
          </VStack>
        </NoisyCard>
      </Card>
    </FadeInOnView>
  )
}

/** Compact swatch + label combo for the header legend strip. `variant='line'`
 *  draws a thin pill (suits "line series" entries like spot / centeredness);
 *  default draws a small square (suits filled band entries). */
function LegendChip({
  color,
  label,
  variant,
}: {
  color: string
  label: string
  variant?: 'line'
}) {
  return (
    <HStack spacing="2xs">
      <Box
        bg={color}
        h={variant === 'line' ? '2px' : '8px'}
        rounded={variant === 'line' ? 'full' : 'sm'}
        w="10px"
      />
      <Text>{label}</Text>
    </HStack>
  )
}

function Body({
  loading,
  loaded,
  error,
  option,
  validSampleCount,
}: {
  loading: boolean
  loaded: boolean
  error: Error | null
  option: ReturnType<typeof buildChartOption>
  validSampleCount: number
}) {
  if (loading && !loaded) {
    return (
      <Flex align="center" direction="column" gap="sm" h="full" justify="center">
        <Spinner color="font.linkHover" size="md" thickness="3px" />
        <Text color="font.secondary" fontSize="sm">
          Sampling AutoRange bounds across the active range…
        </Text>
        <Text color="font.secondary" fontSize="2xs" opacity={0.6}>
          One archive call per snapshot; first load can take a few seconds.
        </Text>
      </Flex>
    )
  }
  if (error) {
    return (
      <Flex align="center" direction="column" gap="sm" h="full" justify="center">
        <Text color="font.secondary" fontSize="sm">
          Couldn&apos;t load AutoRange history.
        </Text>
        <Text color="font.secondary" fontSize="xs" maxW="md" opacity={0.7}>
          {error.message}
        </Text>
      </Flex>
    )
  }
  if (validSampleCount === 0) {
    return (
      <Flex align="center" direction="column" gap="sm" h="full" justify="center">
        <Text color="font.secondary" fontSize="sm">
          No archive samples available for this range.
        </Text>
        <Text color="font.secondary" fontSize="xs" maxW="md" opacity={0.7}>
          Archive RPC reads can be unavailable on some chain / range combinations.
        </Text>
      </Flex>
    )
  }
  return (
    <ReactECharts
      notMerge
      option={option}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
