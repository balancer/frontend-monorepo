'use client'

/**
 * BPT price history card — the LP-token's USD value over the active range,
 * with an optional LP-vs-HODL overlay.
 *
 * `sharePrice` from api-v3's `poolGetSnapshots` is the USD price of one BPT
 * (== totalLiquidity / totalShares). It already rides on the page-level
 * `snapshots` payload — the primary line just plots it; no extra API call,
 * so it paints with the page shell.
 *
 * The second "HODL" line answers "would I have been better off just holding
 * the tokens?". We fix the per-BPT token basket at the range start (t₀) and
 * value that *fixed* basket forward using `tokenGetHistoricalPrices` (fetched
 * lazily via `useHodlComparison`, so it never blocks the BPT line).
 *
 * Crucially, on boosted pools the basket is fixed and valued in the tokens'
 * *underlying* assets, not the ERC4626 wrappers the pool holds. The wrapper's
 * yield accrues to the LP; valuing HODL at the wrapper price would hand that
 * same yield to the HODL side too, cancelling it out and hiding the whole
 * point of LPing a boosted pool. Holding the underlying (e.g. plain USDC)
 * earns no such yield, so LP − HODL surfaces yield + fees − impermanent loss.
 * The wrapped→underlying quantity is pinned at t₀ via the wrapped/underlying
 * price ratio (see `computeHodl`); by construction HODL(t₀) == sharePrice(t₀),
 * so both lines start from the same USD value.
 *
 * Two display modes (header toggle):
 *   - USD       → raw per-BPT / per-basket dollars.
 *   - % RETURN  → both re-based to 0% at t₀, so the (often sub-1%) divergence
 *                 is actually visible off the y-axis.
 *
 * The HODL line hides itself (no crash) whenever the basket can't be priced:
 * a token with no historical series (nested BPT, or a wrapper whose underlying
 * has no feed), a pool younger than its tokens' price history, or the fetch
 * still in flight / errored.
 */

import { Box, Card, Flex, HStack, Heading, Text, VStack } from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useMemo, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { useHodlComparison, type TokenDailyPrices } from '@analytics/lib/hooks/useHodlComparison'
import type { PoolHistoryRange, PoolPageData } from '../../page'
import { HistoryRangeToggle, type HistoryRange } from '../HistoryRangeToggle'

type Token = {
  /** Pool token address (the ERC4626 wrapper on boosted pools) — the unit
   *  `amounts` is denominated in. */
  address: string
  symbol: string
  /** True when this pool token is a yield-bearing ERC4626 wrapper. */
  isErc4626: boolean
  /** The wrapper's underlying asset, or null on non-wrapped tokens. */
  underlyingToken: { address: string; symbol: string } | null
}

/** The two legs of a token for the HODL basket: `wrapped` (what the pool
 *  actually holds, so its price gives the pool's USD value) and `hodl` (what
 *  the "just held it instead" basket is valued in — the *underlying* for a
 *  yield-bearing wrapper, else the token itself). Fixing the basket in
 *  underlying terms strips the wrapper's yield out of HODL so the LP's yield
 *  advantage shows, instead of accruing to both sides and cancelling. */
type HodlToken = { wrapped: string; hodl: string }

type Props = {
  chain: string
  range: PoolHistoryRange
  snapshots: PoolPageData['snapshots']
  tokens: Token[]
  /** Same handler the top history chart uses — the card's own range buttons
   *  drive the shared `?range=` navigation so both toggles stay in lockstep. */
  onRangeSelect: (next: HistoryRange) => void
  /** Range being navigated to (null = settled). Shows a spinner on the
   *  pending button, matching the top chart's toggle. */
  pendingRange: HistoryRange | null
}

/** `return` normalizes both lines to 0% at t₀ (the window start) so the
 *  otherwise-tiny LP-vs-HODL divergence is actually visible; `usd` shows the
 *  raw per-BPT / per-basket dollar value. */
type Mode = 'usd' | 'return'

type Sample = PoolPageData['snapshots'][number]

const RANGE_LABEL: Record<PoolHistoryRange, string> = {
  '30d': '30d',
  '90d': '90d',
  '180d': '180d',
  '1y': '1y',
  all: 'all-time',
}

/** Caption phrasing for the delta — mirrors PoolSnapshotTile's wording so
 *  the two cards read as one product. */
const RANGE_DELTA_HINT: Record<PoolHistoryRange, string> = {
  '30d': 'vs 30 days ago',
  '90d': 'vs 90 days ago',
  '180d': 'vs 180 days ago',
  '1y': 'vs 1 year ago',
  all: 'since pool creation',
}

const CHART_COLORS = {
  lp: '#9f95f0', // violet — the LP unit
  lpAreaFrom: 'rgba(159, 149, 240, 0.22)',
  lpAreaTo: 'rgba(159, 149, 240, 0.0)',
  hodl: '#E6C6A0', // tan — the hypothetical HODL basket
  axisText: '#9aa3b2',
  axisLine: 'rgba(255, 255, 255, 0.08)',
  splitLine: 'rgba(255, 255, 255, 0.06)',
  tooltipBg: 'rgba(20, 22, 30, 0.92)',
  tooltipBorder: 'rgba(255, 255, 255, 0.06)',
  tooltipText: '#e5e7eb',
  tooltipHead: '#E5D3BE',
} as const

const DAY = 86400
const dayStart = (tsSeconds: number): number => Math.floor(tsSeconds / DAY) * DAY

/** BPT prices span orders of magnitude (a stable BPT ≈ $1.02, an ETH pool
 *  BPT ≈ $2.4k, a BTC pool BPT ≈ $60k). Scale the precision to the value so
 *  small prices don't collapse to "$1.02" and lose their basis-point moves. */
function formatUsdPrice(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  const maximumFractionDigits = abs >= 1000 ? 2 : abs >= 1 ? 4 : 6
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(n)
}

const usdCompact = (n: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n || 0)

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

function deltaPct(curr: number, prev: number): number | null {
  if (!Number.isFinite(curr) || !Number.isFinite(prev) || prev <= 0) return null
  return ((curr - prev) / prev) * 100
}

function DeltaBadge({ pct }: { pct: number | null }): React.JSX.Element | null {
  if (pct === null || !Number.isFinite(pct)) return null
  const positive = pct >= 0
  return (
    <Text
      color={positive ? 'green.400' : 'red.400'}
      fontFamily="mono"
      fontSize="sm"
      fontWeight={500}
    >
      {positive ? '+' : ''}
      {pct.toFixed(2)}%
    </Text>
  )
}

function LegendChip({
  color,
  label,
  dim,
}: {
  color: string
  label: string
  dim?: boolean
}): React.JSX.Element {
  return (
    <HStack opacity={dim ? 0.5 : 1} spacing="2xs">
      <Box bg={color} borderRadius="full" flexShrink={0} h="8px" w="8px" />
      <Text color="font.secondary" fontSize="xs">
        {label}
      </Text>
    </HStack>
  )
}

function ModeToggle({
  mode,
  onSelect,
}: {
  mode: Mode
  onSelect: (next: Mode) => void
}): React.JSX.Element {
  const OPTIONS: Array<{ value: Mode; label: string }> = [
    { value: 'usd', label: 'USD' },
    { value: 'return', label: '% RETURN' },
  ]
  return (
    <Flex
      align="center"
      bg="background.level1"
      border="1px solid"
      borderColor="border.base"
      gap="0"
      p="2xs"
      rounded="full"
    >
      {OPTIONS.map(opt => {
        const isActive = opt.value === mode
        return (
          <Box
            _hover={isActive ? undefined : { color: 'font.primary', bg: 'background.level2' }}
            aria-current={isActive ? 'true' : undefined}
            bg={isActive ? 'background.level3' : 'transparent'}
            border="1px solid"
            borderColor={isActive ? 'border.base' : 'transparent'}
            color={isActive ? 'font.primary' : 'font.secondary'}
            cursor="pointer"
            fontSize="xs"
            fontWeight={isActive ? 600 : 500}
            key={opt.value}
            letterSpacing="0.02em"
            onClick={() => onSelect(opt.value)}
            px="ms"
            py="2xs"
            role="button"
            rounded="full"
            transition="background 0.15s, color 0.15s, border-color 0.15s"
            userSelect="none"
            whiteSpace="nowrap"
          >
            {opt.label}
          </Box>
        )
      })}
    </Flex>
  )
}

/** Per-BPT HODL basket valued forward from a fixed reference point.
 *  `values[i]` aligns with `samples[i]` (null before t₀ or where a token is
 *  unpriced that day). `baseIndex` / `baseValue` are the t₀ anchor. */
type HodlResult = {
  values: (number | null)[]
  baseIndex: number
  baseValue: number
}

/** Price on the snapshot's UTC-day, walking back up to two weeks to bridge a
 *  missing bucket (token oracle gap) before giving up. */
function priceAt(daily: Map<number, number>, tsSeconds: number): number | null {
  const start = dayStart(tsSeconds)
  for (let back = 0; back <= 14; back++) {
    const p = daily.get(start - back * DAY)
    if (p != null) return p
  }
  return null
}

function computeHodl(
  samples: Sample[],
  hodlTokens: HodlToken[],
  series: TokenDailyPrices[] | null
): HodlResult | null {
  if (!series || series.length === 0 || hodlTokens.length === 0) return null

  const byAddr = new Map(series.map(s => [s.address, s.daily]))
  // Each token needs two price series: `wrapped` (values the pool's holding,
  // in the ERC4626 units `amounts` is denominated in) and `hodl` (values the
  // fixed alternative basket — the underlying for a wrapper). For non-wrapped
  // tokens the two addresses are identical, so both resolve to one series.
  const legs = hodlTokens.map(t => ({
    wrapped: byAddr.get(t.wrapped),
    hodl: byAddr.get(t.hodl),
  }))
  if (legs.some(l => l.wrapped == null || l.hodl == null)) return null
  const priced = legs as { wrapped: Map<number, number>; hodl: Map<number, number> }[]

  // t₀ = first snapshot with a well-formed amounts vector and a price (both
  // legs) for every token. Almost always the range's first sample; later only
  // when a token's price history starts inside the window.
  //
  // Fix the HODL quantities *in underlying terms* here: the pool holds
  // `amounts/totalShares` wrapped tokens per BPT, worth `× wrappedPx(t₀)` in
  // USD; dividing by the underlying price at t₀ converts that to a fixed
  // underlying quantity. `wrappedPx/hodlPx` is exactly the ERC4626 conversion
  // rate at t₀ (== 1 for non-wrapped tokens). By construction the basket's t₀
  // value equals sharePrice(t₀), so both lines start together.
  let baseIndex = -1
  let qty: number[] | null = null
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i]
    if (!s.amounts || s.amounts.length !== hodlTokens.length || !(s.totalShares > 0)) continue
    const wpx = priced.map(l => priceAt(l.wrapped, s.timestamp))
    const hpx = priced.map(l => priceAt(l.hodl, s.timestamp))
    if (wpx.some(p => p == null) || hpx.some(p => p == null)) continue
    qty = s.amounts.map((a, k) => (a / s.totalShares) * ((wpx[k] as number) / (hpx[k] as number)))
    baseIndex = i
    break
  }
  if (!qty || baseIndex < 0) return null

  const values: (number | null)[] = samples.map((s, i) => {
    if (i < baseIndex) return null
    const hpx = priced.map(l => priceAt(l.hodl, s.timestamp))
    if (hpx.some(p => p == null)) return null
    let v = 0
    for (let k = 0; k < qty!.length; k++) v += qty![k] * (hpx[k] as number)
    return v
  })

  const baseValue = values[baseIndex]
  if (baseValue == null || !(baseValue > 0)) return null
  return { values, baseIndex, baseValue }
}

/** LP-vs-HODL spread at the latest commonly-priced sample: how much more (or
 *  less) one BPT is worth than having held the tokens since t₀. Pure top-level
 *  helper so the caller's `useMemo` body stays a single expression (keeps the
 *  React Compiler's manual-memoization preservation happy). */
function lastSpread(hodl: HodlResult | null, samples: Sample[]): number | null {
  if (!hodl) return null
  for (let i = samples.length - 1; i >= hodl.baseIndex; i--) {
    const h = hodl.values[i]
    if (h != null && h > 0) return deltaPct(samples[i].sharePrice, h)
  }
  return null
}

export function PoolBptPriceHistory({
  chain,
  range,
  snapshots,
  tokens,
  onRangeSelect,
  pendingRange,
}: Props): React.JSX.Element {
  const [mode, setMode] = useState<Mode>('usd')

  // Page-level snapshots are already trimmed to the active range; we only
  // sort defensively and drop any zero/invalid sharePrice points (a fresh
  // pool's first snapshot can land before the price oracle has a value).
  const samples = useMemo(
    () =>
      [...snapshots]
        .filter(s => Number.isFinite(s.sharePrice) && s.sharePrice > 0)
        .sort((a, b) => a.timestamp - b.timestamp),
    [snapshots]
  )

  const hasData = samples.length >= 2

  // HODL basket legs: value the alternative in *underlying* terms for boosted
  // tokens (else the wrapper's yield lands in both LP and HODL and cancels).
  const hodlTokens = useMemo<HodlToken[]>(
    () =>
      tokens.map(t => ({
        wrapped: t.address.toLowerCase(),
        hodl: (t.isErc4626 && t.underlyingToken
          ? t.underlyingToken.address
          : t.address
        ).toLowerCase(),
      })),
    [tokens]
  )
  const anyBoosted = useMemo(() => tokens.some(t => t.isErc4626 && t.underlyingToken), [tokens])
  // Boosted pools compare against holding the *underlying* assets, so the
  // label says so; plain pools just hold the pool tokens.
  const hodlLabel = anyBoosted ? 'HODL underlying' : 'HODL basket'
  // Fetch the union of wrapped + underlying addresses (deduped). The wrapped
  // price anchors the pool's USD value at t₀; the underlying price values the
  // HODL basket forward.
  const fetchAddresses = useMemo(
    () => Array.from(new Set(hodlTokens.flatMap(t => [t.wrapped, t.hodl]))),
    [hodlTokens]
  )

  // Defer the HODL fetch until the card scrolls near the viewport — most
  // visitors never reach it, so gating on visibility drops the extra
  // `/api/token-prices` request entirely for them (cuts per-pool query load
  // and eases api-v3 rate pressure). `once: true` latches, so range toggles
  // after the first view still refetch; the 240px margin warms it just before
  // it's on screen so the line is already there when the user arrives.
  const cardRef = useRef<HTMLDivElement>(null)
  const inView = useInView(cardRef, { once: true, margin: '240px 0px' })

  // The BPT line renders immediately from on-page snapshots; only the HODL
  // overlay waits for `inView`. `addressesKey` keeps the hook's effect stable
  // across renders (see useHodlComparison).
  const { series: priceSeries, loading: hodlLoading } = useHodlComparison(
    chain,
    fetchAddresses,
    range,
    hasData && inView
  )
  const hodl = useMemo(
    () => computeHodl(samples, hodlTokens, priceSeries),
    [samples, hodlTokens, priceSeries]
  )

  // Both lines anchor to t₀ so % RETURN reads 0% at the window start and the
  // LP/HODL divergence is measured from a shared origin. Without HODL, t₀ is
  // just the range start.
  const anchorIndex = hodl?.baseIndex ?? 0
  const lpBase = samples[anchorIndex]?.sharePrice ?? 0
  const latest = samples[samples.length - 1]?.sharePrice ?? 0
  const change = hasData ? deltaPct(latest, lpBase) : null

  // LP-vs-HODL spread at the last commonly-priced sample: how much more (or
  // less) one BPT is worth than having just held the tokens since t₀.
  const spread = useMemo(() => lastSpread(hodl, samples), [hodl, samples])

  const option = useMemo(
    () => buildOption(samples, mode, lpBase, hodl, hodlLabel),
    [samples, mode, lpBase, hodl, hodlLabel]
  )

  // Headline is always the current USD price — the "what is a BPT worth now"
  // fact — regardless of chart mode. The delta badge carries the % change
  // since the window start.
  const headlineValue = hasData ? formatUsdPrice(latest) : '—'

  // Before the card is in view the fetch hasn't started; treat that as
  // "loading" rather than "n/a" so the deferred state never reads as a
  // failure. Once `inView` latches, `hodlLoading` takes over.
  const hodlPending = hodlLoading || (!inView && hasData)

  return (
    <FadeInOnView animateOnce={false}>
      <Card overflow="hidden" ref={cardRef} variant="level1">
        <NoisyCard
          cardProps={{ height: 'full', overflow: 'hidden' }}
          contentProps={{ display: 'flex' }}
        >
          <VStack align="stretch" h="full" p={{ base: 'sm', md: 'md' }} spacing="md" w="full">
            <Flex
              align={{ base: 'flex-start', md: 'flex-start' }}
              direction={{ base: 'column', md: 'row' }}
              gap="md"
              justify="space-between"
            >
              {/* Identity + chart-mode control, grouped on the left. The
                  USD / % RETURN toggle sits directly under the price it
                  reformats, so it no longer competes with the range selector
                  for space on the right. */}
              <VStack align="flex-start" spacing="sm">
                <VStack align="flex-start" spacing="2xs">
                  <Heading size="h5">BPT price</Heading>
                  <HStack align="baseline" spacing="sm">
                    <Heading fontWeight={600} size="h4">
                      {headlineValue}
                    </Heading>
                    <DeltaBadge pct={change} />
                  </HStack>
                  <Text color="font.secondary" fontSize="xs">
                    {hasData
                      ? `${samples.length} snapshots · ${RANGE_LABEL[range]} · ${
                          mode === 'return'
                            ? `0% = ${fmtDateShort(samples[anchorIndex].timestamp * 1000)}`
                            : RANGE_DELTA_HINT[range]
                        }`
                      : 'Not enough price snapshots in range to chart yet.'}
                  </Text>
                </VStack>
                {hasData && <ModeToggle mode={mode} onSelect={setMode} />}
              </VStack>
              {/* Time-window selector alone on the right, harmonized with the
                  top history chart's toggle. */}
              <HistoryRangeToggle
                onSelect={onRangeSelect}
                pendingRange={pendingRange}
                range={range}
              />
            </Flex>

            {/* Legend + LP-vs-HODL comparison share one uncramped row above
                the chart, so neither crowds the header controls. */}
            {hasData && (
              <Flex
                align="center"
                bg="background.level0"
                border="1px solid"
                borderColor="border.subduedZen"
                borderRadius="md"
                columnGap="md"
                flexWrap="wrap"
                justify="space-between"
                px="md"
                py="sm"
                rowGap="xs"
              >
                <HStack columnGap="md" flexWrap="wrap" rowGap="2xs" spacing="0">
                  <LegendChip color={CHART_COLORS.lp} label="BPT price (LP)" />
                  <LegendChip
                    color={CHART_COLORS.hodl}
                    dim={!hodl}
                    label={
                      hodl
                        ? hodlLabel
                        : hodlPending
                          ? `${hodlLabel} · loading…`
                          : `${hodlLabel} · n/a`
                    }
                  />
                </HStack>
                {hodl && spread != null && (
                  <HStack spacing="xs">
                    <Text color="font.secondary" fontSize="xs" opacity={0.7}>
                      {anyBoosted ? 'vs holding underlying' : 'vs holding tokens'} since{' '}
                      {fmtDateShort(samples[hodl.baseIndex].timestamp * 1000)}
                    </Text>
                    <DeltaBadge pct={spread} />
                    <Text color="font.secondary" fontSize="xs">
                      {spread >= 0 ? 'LPing beat holding' : 'holding beat LPing'}
                    </Text>
                  </HStack>
                )}
              </Flex>
            )}

            <Box h={{ base: '280px', md: '340px' }} position="relative" w="full">
              {hasData ? (
                <ReactECharts notMerge option={option} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Flex align="center" h="full" justify="center">
                  <Text color="font.secondary" fontSize="sm">
                    No BPT price snapshots in this range.
                  </Text>
                </Flex>
              )}
            </Box>
          </VStack>
        </NoisyCard>
      </Card>
    </FadeInOnView>
  )
}

// ── ECharts option builder ─────────────────────────────────────────────

function buildOption(
  samples: Sample[],
  mode: Mode,
  lpBase: number,
  hodl: HodlResult | null,
  hodlLabel: string
) {
  // ECharts time axis wants ms; api-v3 emits unix seconds. In % RETURN mode we
  // express each point as its percentage change from the t₀ base, so both
  // lines start at 0% and the divergence reads directly off the y-axis.
  const asReturn = (value: number, base: number): number =>
    base > 0 ? (100 * (value - base)) / base : 0
  const lpY = (price: number): number => (mode === 'return' ? asReturn(price, lpBase) : price)
  const lpData = samples.map(s => [s.timestamp * 1000, lpY(s.sharePrice)] as const)

  const hodlData =
    hodl != null
      ? samples.map((s, i) => {
          const v = hodl.values[i]
          if (v == null) return [s.timestamp * 1000, null] as const
          const y = mode === 'return' ? asReturn(v, hodl.baseValue) : v
          return [s.timestamp * 1000, y] as const
        })
      : null

  const dot = (color: string): string =>
    `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px;vertical-align:middle"></span>`

  const series: Record<string, unknown>[] = [
    {
      name: 'BPT price (LP)',
      type: 'line',
      smooth: true,
      symbol: 'none',
      showSymbol: false,
      lineStyle: { color: CHART_COLORS.lp, width: 2 },
      itemStyle: { color: CHART_COLORS.lp },
      // Area fill only in USD mode, where the single price line is the focus.
      // In % RETURN mode both lines are compared head-to-head, so we keep them
      // as clean strokes (a filled LP area would visually outweigh the HODL
      // line it's being measured against).
      areaStyle:
        mode === 'usd'
          ? {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: CHART_COLORS.lpAreaFrom },
                  { offset: 1, color: CHART_COLORS.lpAreaTo },
                ],
              },
            }
          : undefined,
      data: lpData,
    },
  ]
  if (hodlData) {
    series.push({
      name: hodlLabel,
      type: 'line',
      smooth: true,
      symbol: 'none',
      showSymbol: false,
      connectNulls: false,
      lineStyle: { color: CHART_COLORS.hodl, width: 2, type: 'dashed' },
      itemStyle: { color: CHART_COLORS.hodl },
      data: hodlData,
    })
  }

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
      formatter: (params: { dataIndex: number }[]) => {
        const i = params[0]?.dataIndex
        if (i === undefined) return ''
        const s = samples[i]
        const date = new Date(s.timestamp * 1000).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
        // In % RETURN mode append each line's return-from-t₀ next to its USD
        // value, so the tooltip explains what the axis is showing.
        const pctSuffix = (value: number, base: number): string => {
          if (mode !== 'return' || !(base > 0)) return ''
          const r = (100 * (value - base)) / base
          return ` <span style="opacity:0.6">(${r >= 0 ? '+' : ''}${r.toFixed(2)}%)</span>`
        }
        const lpUsd = formatUsdPrice(s.sharePrice)
        const hodlVal = hodl?.values[i] ?? null
        const rows: string[] = [
          `<div style="display:flex;justify-content:space-between;gap:18px;padding:1px 0"><span style="opacity:0.85">${dot(CHART_COLORS.lp)}BPT price (LP)</span><span style="font-family:ui-monospace,monospace">${lpUsd}${pctSuffix(s.sharePrice, lpBase)}</span></div>`,
        ]
        if (hodlVal != null) {
          rows.push(
            `<div style="display:flex;justify-content:space-between;gap:18px;padding:1px 0"><span style="opacity:0.85">${dot(CHART_COLORS.hodl)}${hodlLabel}</span><span style="font-family:ui-monospace,monospace">${formatUsdPrice(hodlVal)}${pctSuffix(hodlVal, hodl!.baseValue)}</span></div>`
          )
          const gap = hodlVal > 0 ? ((s.sharePrice - hodlVal) / hodlVal) * 100 : 0
          rows.push(
            `<div style="display:flex;justify-content:space-between;gap:18px;padding:1px 0;margin-top:2px;border-top:1px solid rgba(255,255,255,0.08)"><span style="opacity:0.7">LP vs HODL</span><span style="font-family:ui-monospace,monospace">${gap >= 0 ? '+' : ''}${gap.toFixed(2)}%</span></div>`
          )
        }
        return `<div style="font-weight:600;margin-bottom:6px;color:${CHART_COLORS.tooltipHead}">${date}</div>${rows.join('')}`
      },
    },
    legend: { show: false },
    grid: { left: 8, right: 12, top: 12, bottom: 28, containLabel: true },
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
      scale: true,
      axisLabel: {
        color: CHART_COLORS.axisText,
        fontSize: 11,
        formatter: (v: number) =>
          mode === 'usd' ? usdCompact(v) : `${v > 0 ? '+' : ''}${v.toFixed(0)}%`,
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: CHART_COLORS.splitLine } },
    },
    series,
  }
}
