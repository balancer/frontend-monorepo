'use client'

/**
 * QuantAMM / BTF weight-shift history card.
 *
 * Three coupled visualizations on one card:
 *   1. Stacked-area weight chart over the active range (0..100% per token).
 *   2. Drift / velocity grid — start/end weight + delta + avg pp/day per
 *      token across the visible range.
 *   3. Rule-parameters card — per-token lambda, plus global update interval,
 *      epsilonMax, guard rails, max trade size, and oracle staleness.
 *
 * All data is sourced from api-v3 (`weightSnapshots` + `quantAmmWeightedParams`
 * via the inline fragment in the pool detail page query) — no on-chain reads
 * here. The range filter is applied client-side from the page-level
 * `?range=` so this card stays in sync with the rest of the pool page.
 */

import { Box, Card, Flex, Grid, HStack, Heading, Text, VStack } from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import type {
  PoolHistoryRange,
  QuantAmmWeightSnapshot,
  QuantAmmWeightedParams,
} from '../../page'

type Token = {
  address: string
  symbol: string
  logoURI: string | null
}

type Props = {
  range: PoolHistoryRange
  tokens: Token[]
  weightSnapshots: QuantAmmWeightSnapshot[]
  params: QuantAmmWeightedParams | null
}

const RANGE_LABEL: Record<PoolHistoryRange, string> = {
  '30d': '30d',
  '90d': '90d',
  '180d': '180d',
  '1y': '1y',
  all: 'all-time',
}

/** Per-range cutoff in seconds. Anchored to the latest snapshot timestamp
 *  rather than `Date.now()` so the filter is a pure function of inputs and
 *  matches the snapshot page's "anchor on latest sample" trim logic. */
const RANGE_SECONDS: Record<Exclude<PoolHistoryRange, 'all'>, number> = {
  '30d': 30 * 86400,
  '90d': 90 * 86400,
  '180d': 180 * 86400,
  '1y': 365 * 86400,
}

// Token palette — same 8-color tuple frontend-v3's PoolWeightShiftsChart
// uses so users moving between the apps see the same color per token. Wraps
// for >8 tokens, which is rare for QuantAMM pools.
const TOKEN_COLORS = [
  '#E6C6A0', // tan accent (matches the brand "special" tone)
  '#9f95f0', // violet
  '#25e2a4', // teal
  '#EA9A43', // orange
  '#56c596', // green
  '#b3aef5', // soft purple
  '#5a8dee', // blue
  '#e26b9c', // pink
] as const

const CHART_COLORS = {
  axisText: '#9aa3b2',
  axisLine: 'rgba(255, 255, 255, 0.08)',
  splitLine: 'rgba(255, 255, 255, 0.06)',
  tooltipBg: 'rgba(20, 22, 30, 0.92)',
  tooltipBorder: 'rgba(255, 255, 255, 0.06)',
  tooltipText: '#e5e7eb',
} as const

const pctFmt = (n: number, digits = 2): string => {
  if (!Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(digits)}%`
}

const ppFmt = (n: number, digits = 2): string => {
  if (!Number.isFinite(n)) return '—'
  const sign = n > 0 ? '+' : ''
  return `${sign}${(n * 100).toFixed(digits)}pp`
}

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

/** api-v3 returns 1e18-scaled fractional params as decimal strings. Some
 *  fields (lambda, epsilonMax) are tiny; others (guard rail, max trade
 *  size) sit closer to 1. Returns NaN on parse failure so callers can show
 *  a placeholder. */
function parseE18(value: string | null | undefined): number {
  if (!value) return NaN
  const n = Number(value) / 1e18
  return Number.isFinite(n) ? n : NaN
}

function parseSeconds(value: string | null | undefined): number {
  if (!value) return NaN
  const n = Number(value)
  return Number.isFinite(n) ? n : NaN
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—'
  if (seconds < 60) return `${seconds.toFixed(0)} s`
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} h`
  const days = seconds / 86400
  return days >= 30 ? `${(days / 30).toFixed(1)} mo` : `${days.toFixed(1)} d`
}

function formatRelative(unixSeconds: number): string {
  if (!Number.isFinite(unixSeconds) || unixSeconds <= 0) return '—'
  const diff = Math.floor(Date.now() / 1000) - unixSeconds
  if (diff < 0) return `in ${formatDuration(-diff)}`
  return `${formatDuration(diff)} ago`
}

export function PoolQuantAmmHistory({ range, tokens, weightSnapshots, params }: Props) {
  // Filter snapshots to the active range. `all` shows the full series.
  const samples = useMemo(() => {
    const valid = weightSnapshots.filter(
      s => Array.isArray(s.weights) && s.weights.length === tokens.length
    ) as { timestamp: number; weights: number[] }[]
    if (range === 'all' || valid.length === 0) return valid
    const latest = valid[valid.length - 1].timestamp
    const cutoff = latest - RANGE_SECONDS[range]
    return valid.filter(s => s.timestamp >= cutoff)
  }, [weightSnapshots, tokens.length, range])

  const drift = useMemo(() => computeDrift(samples, tokens.length), [samples, tokens.length])

  const option = useMemo(() => buildChartOption(samples, tokens), [samples, tokens])

  const hasData = samples.length >= 2

  return (
    <FadeInOnView animateOnce={false}>
      <Card overflow="hidden" variant="level1">
        <NoisyCard
          cardProps={{ height: 'full', overflow: 'hidden' }}
          contentProps={{ display: 'flex' }}
        >
          <VStack align="stretch" h="full" p={{ base: 'sm', md: 'md' }} spacing="md" w="full">
            <Flex
              align={{ base: 'flex-start', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
              gap="sm"
              justify="space-between"
            >
              <VStack align="flex-start" spacing="xs">
                <Heading size="h5">Weight history</Heading>
                <Text color="font.secondary" fontSize="xs">
                  {hasData
                    ? `${samples.length} snapshots · ${RANGE_LABEL[range]}`
                    : 'Not enough snapshots in range to chart yet.'}
                </Text>
              </VStack>
              <HStack
                color="font.secondary"
                flexWrap="wrap"
                fontSize="xs"
                rowGap="xs"
                spacing="md"
              >
                {tokens.map((t, i) => (
                  <LegendChip
                    color={TOKEN_COLORS[i % TOKEN_COLORS.length]}
                    key={t.address}
                    label={t.symbol}
                  />
                ))}
              </HStack>
            </Flex>

            <Box h={{ base: '320px', md: '380px' }} position="relative" w="full">
              {hasData ? (
                <ReactECharts notMerge option={option} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Flex align="center" h="full" justify="center">
                  <Text color="font.secondary" fontSize="sm">
                    No weight snapshots in this range.
                  </Text>
                </Flex>
              )}
            </Box>

            {hasData && (
              <DriftGrid drift={drift} rangeLabel={RANGE_LABEL[range]} tokens={tokens} />
            )}

            <ParametersCard params={params} tokens={tokens} />
          </VStack>
        </NoisyCard>
      </Card>
    </FadeInOnView>
  )
}

// ── Drift / velocity grid ──────────────────────────────────────────────

type TokenDrift = {
  start: number
  end: number
  deltaPp: number
  perDayPp: number
  /** Largest single-step jump in the range, in percentage points. Surfaces
   *  whether the rebalance was a smooth glide or a step-change. */
  maxStepPp: number
}

function computeDrift(
  samples: { timestamp: number; weights: number[] }[],
  tokenCount: number
): TokenDrift[] {
  if (samples.length < 2 || tokenCount === 0) {
    return Array.from({ length: tokenCount }, () => ({
      start: NaN,
      end: NaN,
      deltaPp: NaN,
      perDayPp: NaN,
      maxStepPp: NaN,
    }))
  }
  const first = samples[0]
  const last = samples[samples.length - 1]
  const days = Math.max((last.timestamp - first.timestamp) / 86400, 1 / 24) // 1h floor
  return Array.from({ length: tokenCount }, (_, i) => {
    const start = first.weights[i] ?? NaN
    const end = last.weights[i] ?? NaN
    const deltaPp = end - start
    let maxStepPp = 0
    for (let k = 1; k < samples.length; k++) {
      const prev = samples[k - 1].weights[i]
      const curr = samples[k].weights[i]
      if (typeof prev !== 'number' || typeof curr !== 'number') continue
      const step = Math.abs(curr - prev)
      if (step > maxStepPp) maxStepPp = step
    }
    return { start, end, deltaPp, perDayPp: deltaPp / days, maxStepPp }
  })
}

function DriftGrid({
  drift,
  tokens,
  rangeLabel,
}: {
  drift: TokenDrift[]
  tokens: Token[]
  rangeLabel: string
}) {
  return (
    <Box>
      <Flex align="center" justify="space-between" mb="xs">
        <Text color="font.secondary" fontSize="xs" letterSpacing="0.4px" textTransform="uppercase">
          Drift &amp; velocity · {rangeLabel}
        </Text>
        <Text color="font.secondary" fontSize="2xs" opacity={0.7}>
          start → end · Δ · avg pp/day · max step
        </Text>
      </Flex>
      <Grid
        gap="sm"
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, minmax(0, 1fr))',
          lg: `repeat(${Math.min(tokens.length, 4)}, minmax(0, 1fr))`,
        }}
      >
        {tokens.map((t, i) => {
          const d = drift[i]
          const dirColor =
            !Number.isFinite(d.deltaPp) || Math.abs(d.deltaPp) < 0.0001
              ? 'font.secondary'
              : d.deltaPp > 0
                ? 'green.300'
                : 'red.300'
          return (
            <Box
              bg="background.level0"
              border="1px solid"
              borderColor="border.subduedZen"
              borderRadius="md"
              key={t.address}
              p="sm"
            >
              <HStack justify="space-between" mb="xs">
                <HStack spacing="xs">
                  <Box
                    bg={TOKEN_COLORS[i % TOKEN_COLORS.length]}
                    borderRadius="full"
                    h="8px"
                    w="8px"
                  />
                  <Text fontSize="sm" fontWeight="semibold">
                    {t.symbol}
                  </Text>
                </HStack>
                <Text color={dirColor} fontFamily="mono" fontSize="sm" fontWeight="bold">
                  {ppFmt(d.deltaPp)}
                </Text>
              </HStack>
              <HStack color="font.secondary" fontSize="xs" justify="space-between">
                <Text>
                  {pctFmt(d.start, 1)} → {pctFmt(d.end, 1)}
                </Text>
              </HStack>
              <HStack color="font.secondary" fontSize="xs" justify="space-between" mt="2xs">
                <Text>{ppFmt(d.perDayPp, 3)}/d</Text>
                <Text>step ≤ {ppFmt(d.maxStepPp, 2)}</Text>
              </HStack>
            </Box>
          )
        })}
      </Grid>
    </Box>
  )
}

// ── Rule-parameters card ────────────────────────────────────────────────

function ParametersCard({
  params,
  tokens,
}: {
  params: QuantAmmWeightedParams | null
  tokens: Token[]
}) {
  if (!params) {
    return (
      <Box
        bg="background.level0"
        border="1px solid"
        borderColor="border.subduedZen"
        borderRadius="md"
        p="sm"
      >
        <Text color="font.secondary" fontSize="sm">
          Rule parameters are not exposed for this pool.
        </Text>
      </Box>
    )
  }

  const updateInterval = parseSeconds(params.updateInterval)
  const oracleStaleness = parseSeconds(params.oracleStalenessThreshold)
  const lastUpdate = parseSeconds(params.lastUpdateIntervalTime)
  const lastInterp = parseSeconds(params.lastInterpolationTimePossible)
  const epsilonMax = parseE18(params.epsilonMax)
  const guardRail = parseE18(params.absoluteWeightGuardRail)
  const maxTradeRatio = parseE18(params.maxTradeSizeRatio)

  return (
    <Box>
      <Text
        color="font.secondary"
        fontSize="xs"
        letterSpacing="0.4px"
        mb="xs"
        textTransform="uppercase"
      >
        Rule parameters
      </Text>
      <Grid gap="md" templateColumns={{ base: '1fr', md: '1fr 1fr' }}>
        <Box
          bg="background.level0"
          border="1px solid"
          borderColor="border.subduedZen"
          borderRadius="md"
          p="sm"
        >
          <Text color="font.secondary" fontSize="2xs" mb="xs" textTransform="uppercase">
            Per-token λ (lambda)
          </Text>
          <VStack align="stretch" spacing="2xs">
            {tokens.map((t, i) => {
              const lambda = parseE18(params.lambda[i])
              return (
                <HStack justify="space-between" key={t.address}>
                  <HStack spacing="xs">
                    <Box
                      bg={TOKEN_COLORS[i % TOKEN_COLORS.length]}
                      borderRadius="full"
                      h="6px"
                      w="6px"
                    />
                    <Text fontSize="sm">{t.symbol}</Text>
                  </HStack>
                  <Text fontFamily="mono" fontSize="sm">
                    {Number.isFinite(lambda) ? lambda.toFixed(6) : '—'}
                  </Text>
                </HStack>
              )
            })}
          </VStack>
        </Box>

        <Box
          bg="background.level0"
          border="1px solid"
          borderColor="border.subduedZen"
          borderRadius="md"
          p="sm"
        >
          <Text color="font.secondary" fontSize="2xs" mb="xs" textTransform="uppercase">
            Schedule &amp; guard rails
          </Text>
          <VStack align="stretch" spacing="2xs">
            <ParamRow
              hint="Cadence at which the rule recomputes target weights."
              label="Update interval"
              value={formatDuration(updateInterval)}
            />
            <ParamRow
              hint="Last on-chain weight-rule update."
              label="Last update"
              value={formatRelative(lastUpdate)}
            />
            <ParamRow
              hint="Time horizon past which interpolation between weight checkpoints stops."
              label="Last interp. window"
              value={formatRelative(lastInterp)}
            />
            <ParamRow
              hint="Max per-step weight change ratio."
              label="ε max"
              value={Number.isFinite(epsilonMax) ? epsilonMax.toFixed(6) : '—'}
            />
            <ParamRow
              hint="Hard floor under which no single token weight may fall."
              label="Min weight guard"
              value={pctFmt(guardRail, 2)}
            />
            <ParamRow
              hint="Cap on trade-size impact, expressed as a fraction of pool TVL."
              label="Max trade size"
              value={pctFmt(maxTradeRatio, 2)}
            />
            <ParamRow
              hint="Oracle data staleness threshold before the rule pauses updates."
              label="Oracle window"
              value={formatDuration(oracleStaleness)}
            />
          </VStack>
        </Box>
      </Grid>
    </Box>
  )
}

function ParamRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <HStack justify="space-between" title={hint}>
      <Text color="font.secondary" fontSize="xs">
        {label}
      </Text>
      <Text fontFamily="mono" fontSize="sm">
        {value}
      </Text>
    </HStack>
  )
}

// ── Legend chip (matches PoolAutoRangeHistory) ─────────────────────────

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <HStack spacing="2xs">
      <Box bg={color} h="8px" rounded="sm" w="10px" />
      <Text>{label}</Text>
    </HStack>
  )
}

// ── ECharts option builder ─────────────────────────────────────────────

function buildChartOption(
  samples: { timestamp: number; weights: number[] }[],
  tokens: Token[]
) {
  // ECharts time axis wants ms timestamps; api-v3 emits unix seconds.
  const x = samples.map(s => s.timestamp * 1000)

  // Convert weights to percentage values for the y-axis. `connectNulls`
  // would otherwise interpolate across gaps; weight history is dense so
  // we don't expect many, but kept defensive.
  const series = tokens.map((t, i) => ({
    name: t.symbol,
    type: 'line' as const,
    stack: 'weights',
    smooth: 0.15,
    symbol: 'none' as const,
    showSymbol: false,
    lineStyle: { color: TOKEN_COLORS[i % TOKEN_COLORS.length], width: 1 },
    areaStyle: { color: TOKEN_COLORS[i % TOKEN_COLORS.length], opacity: 0.75 },
    emphasis: { focus: 'series' as const },
    data: x.map((t2, idx) => {
      const w = samples[idx]?.weights[i]
      return [t2, typeof w === 'number' ? w * 100 : null]
    }),
  }))

  return {
    animation: false,
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: {
        type: 'line' as const,
        lineStyle: { color: CHART_COLORS.axisText, opacity: 0.4, type: 'dashed' as const },
        label: { backgroundColor: CHART_COLORS.tooltipBg, color: CHART_COLORS.tooltipText },
      },
      backgroundColor: CHART_COLORS.tooltipBg,
      borderColor: CHART_COLORS.tooltipBorder,
      borderWidth: 1,
      padding: 10,
      textStyle: { color: CHART_COLORS.tooltipText, fontSize: 12, lineHeight: 18 },
      extraCssText: 'border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,0.35);',
      formatter: (params: { dataIndex: number; data: [number, number | null] }[]) => {
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
        const rows = tokens
          .map((t, k) => {
            const w = samples[i].weights[k]
            const value = typeof w === 'number' ? `${(w * 100).toFixed(2)}%` : '—'
            return `<div style="display:flex;justify-content:space-between;gap:18px;padding:1px 0"><span style="opacity:0.85">${dot(TOKEN_COLORS[k % TOKEN_COLORS.length])}${t.symbol}</span><span style="font-family:ui-monospace,monospace">${value}</span></div>`
          })
          .join('')
        return `<div style="font-weight:600;margin-bottom:6px">${date}</div>${rows}`
      },
    },
    legend: { show: false },
    grid: {
      left: 8,
      right: 12,
      top: 10,
      bottom: 28,
      containLabel: true,
    },
    xAxis: {
      type: 'time' as const,
      axisLabel: {
        color: CHART_COLORS.axisText,
        fontSize: 11,
        margin: 12,
        formatter: (v: number) => fmtDateShort(v),
        hideOverlap: true,
      },
      axisLine: { lineStyle: { color: CHART_COLORS.axisLine } },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: {
        color: CHART_COLORS.axisText,
        fontSize: 11,
        formatter: (v: number) => `${v}%`,
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: CHART_COLORS.splitLine } },
    },
    series,
  }
}
