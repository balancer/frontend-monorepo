'use client'

import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Flex,
  HStack,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spinner,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Sliders } from 'react-feather'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import type { GqlChainValues } from '@repo/lib/config/networks'
import type { OrderFlowRange, OrderFlowResponse } from './api-types'
import { buildSankeyGraph } from './buildSankeyGraph'
import {
  CATEGORY_COLORS,
  formatCategory,
  formatPct,
  formatUsdCompact,
} from './format'
import { PoolOrderFlowSankey, type TokenMap } from './PoolOrderFlowSankey'
import {
  PoolOrderFlowDetailsModal,
  type SankeySelection,
} from './PoolOrderFlowDetailsModal'
import type { LabeledSwap, SourceCategory } from './types'
import { OrderFlowError, usePoolOrderFlowData } from './usePoolOrderFlowData'

const MIN_SWAPS_FOR_RENDER = 10

const RANGE_DAYS: Record<OrderFlowRange, number> = { '24h': 1, '7d': 7, '30d': 30 }

// Filter bounds for the settings popover. Picked to span what's actually
// useful: $0 keeps everything (good on tiny pools), $5k strips down to
// "meaningful" flow on a $10M+ pool.
const MIN_USD_SLIDER_MAX = 5000
const SPLIT_COUNT_SLIDER_MIN = 3
const SPLIT_COUNT_SLIDER_MAX = 30

/** Derive a sensible unknown-split threshold from pool TVL. The default cap
 *  of $10k makes sense on a multi-million-dollar pool, but on a $2k pool
 *  it's higher than the entire TVL — meaning the chart would never split
 *  out any per-sender unknown nodes. Scale to 10% of TVL with a $50 floor
 *  so tiny pools still surface their biggest contributors. */
function defaultUnknownSplitThreshold(poolTvlUsd: number): number {
  const scaled = poolTvlUsd > 0 ? poolTvlUsd * 0.1 : 10000
  return Math.round(Math.min(10000, Math.max(50, scaled)))
}

/** Derive a sensible dust filter from pool TVL. On a $1M+ pool $100 is
 *  fine; on a $2k pool it strips most flow. Floor at $1 so nothing dust-
 *  filters out completely by default on tiny pools. */
function defaultMinUsdPerSwap(poolTvlUsd: number): number {
  if (poolTvlUsd <= 0) return 100
  // 1% of TVL, capped at $100. Rounded down to a "tidy" boundary so the
  // slider default lands on a value the user can reason about.
  const scaled = Math.min(100, poolTvlUsd * 0.01)
  if (scaled >= 100) return 100
  if (scaled >= 25) return 25
  if (scaled >= 10) return 10
  if (scaled >= 5) return 5
  return 1
}

const LEGEND_ORDER: readonly SourceCategory[] = [
  'aggregator',
  'intent',
  'direct',
  'market_maker',
  'mev_bot',
  'bridge',
  'unknown',
]

type PoolToken = {
  address: string
  symbol: string
  logoURI?: string | null
}

type Props = {
  chain: GqlChainValues
  poolId: string
  poolTokens: readonly PoolToken[]
  /** Pool TVL in USD, used to derive sensible defaults for the dust
   *  filter and unknown-split threshold so small pools don't end up with
   *  bigger thresholds than their entire liquidity. */
  poolTvlUsd: number
}

/** Per-range slice of the 30d payload. Recomputed in-memory on each range
 *  toggle — no api-v3 roundtrip. */
type RangeView = {
  swaps: LabeledSwap[]
  volumeUsd: number
  labeledUsd: number
  labeledPct: number
}

function sliceByRange(
  data: OrderFlowResponse,
  range: OrderFlowRange,
  now: number
): RangeView {
  const cutoff = now - RANGE_DAYS[range] * 86400
  // The 30d view is special: don't re-filter, since `data.swaps` already
  // is the 30d set (and possibly capped narrower). Just return as-is.
  const swaps =
    range === '30d' ? data.swaps : data.swaps.filter(s => s.timestamp >= cutoff)
  let volumeUsd = 0
  let labeledUsd = 0
  for (const s of swaps) {
    volumeUsd += s.valueUSD
    if (s.source.category !== 'unknown') labeledUsd += s.valueUSD
  }
  return {
    swaps,
    volumeUsd,
    labeledUsd,
    labeledPct: volumeUsd > 0 ? labeledUsd / volumeUsd : 0,
  }
}

export function PoolOrderFlow({ chain, poolId, poolTokens, poolTvlUsd }: Props) {
  const [range, setRange] = useState<OrderFlowRange>('7d')
  const [selection, setSelection] = useState<SankeySelection | null>(null)
  const { data, loading, error } = usePoolOrderFlowData(chain, poolId)

  // TVL-derived defaults. Memoized on TVL so a snapshot refresh doesn't
  // reset whatever the user has manually dialed in via the popover.
  const defaults = useMemo(
    () => ({
      minUsdPerSwap: defaultMinUsdPerSwap(poolTvlUsd),
      unknownSplitThresholdUsd: defaultUnknownSplitThreshold(poolTvlUsd),
      unknownSplitMaxCount: 15,
    }),
    [poolTvlUsd]
  )
  const [minUsdPerSwap, setMinUsdPerSwap] = useState<number>(defaults.minUsdPerSwap)
  const [unknownSplitThresholdUsd, setUnknownSplitThresholdUsd] = useState<number>(
    defaults.unknownSplitThresholdUsd
  )
  const [unknownSplitMaxCount, setUnknownSplitMaxCount] = useState<number>(
    defaults.unknownSplitMaxCount
  )
  const resetFilters = () => {
    setMinUsdPerSwap(defaults.minUsdPerSwap)
    setUnknownSplitThresholdUsd(defaults.unknownSplitThresholdUsd)
    setUnknownSplitMaxCount(defaults.unknownSplitMaxCount)
  }
  const filtersDirty =
    minUsdPerSwap !== defaults.minUsdPerSwap ||
    unknownSplitThresholdUsd !== defaults.unknownSplitThresholdUsd ||
    unknownSplitMaxCount !== defaults.unknownSplitMaxCount

  const tokenMap = useMemo<TokenMap>(() => {
    const m: TokenMap = {}
    for (const t of poolTokens) {
      m[t.address.toLowerCase()] = { symbol: t.symbol, logoURI: t.logoURI ?? null }
    }
    return m
  }, [poolTokens])

  // Slice the 30d payload to the selected window. Cheap (one pass).
  // The component re-renders on every range click but never re-fetches.
  const view = useMemo<RangeView | null>(() => {
    if (!data) return null
    return sliceByRange(data, range, data.fetchedWindow.to)
  }, [data, range])

  // Aggregate the per-range slice into Sankey nodes/links. Re-runs whenever
  // any of the user-tunable filters change — buildSankeyGraph is pure and
  // O(swaps) so this is cheap even on the 30d cap of swaps.
  const graph = useMemo(() => {
    if (!view) return null
    return buildSankeyGraph(view.swaps, {
      minUsd: minUsdPerSwap,
      unknownSplitThresholdUsd,
      unknownSplitMaxCount,
    })
  }, [view, minUsdPerSwap, unknownSplitThresholdUsd, unknownSplitMaxCount])

  return (
    <FadeInOnView animateOnce={false}>
      <Card overflow="hidden" variant="level1">
        <NoisyCard
          cardProps={{ height: 'full', overflow: 'hidden' }}
          contentProps={{ display: 'flex' }}
        >
          <VStack
            align="stretch"
            h="full"
            p={{ base: 'sm', md: 'md' }}
            spacing="md"
            w="full"
          >
            <Header
              data={data}
              filtersDirty={filtersDirty}
              loading={loading}
              minUsdPerSwap={minUsdPerSwap}
              onMinUsdChange={setMinUsdPerSwap}
              onRangeChange={setRange}
              onResetFilters={resetFilters}
              onSplitMaxCountChange={setUnknownSplitMaxCount}
              onSplitThresholdChange={setUnknownSplitThresholdUsd}
              range={range}
              unknownSplitMaxCount={unknownSplitMaxCount}
              unknownSplitThresholdUsd={unknownSplitThresholdUsd}
              view={view}
            />

            {view && view.swaps.length >= MIN_SWAPS_FOR_RENDER && graph && (
              <CategoryLegend graph={graph} />
            )}

            {/* Explicit height — this card stands alone in the page-level
                column (unlike PoolHistoryChart which sits in a horizontal
                Stack that anchors its height). Without a concrete height
                here the `flex: 1 / minH` chain doesn't resolve and ECharts
                falls back to its internal default of 100px. */}
            <Box h={{ base: '420px', md: '480px' }} position="relative" w="full">
              <Body
                data={data}
                error={error}
                graph={graph}
                loading={loading}
                minUsdPerSwap={minUsdPerSwap}
                onSelect={setSelection}
                tokenMap={tokenMap}
                view={view}
              />
            </Box>
          </VStack>
        </NoisyCard>
      </Card>

      {graph && view && (
        <PoolOrderFlowDetailsModal
          chain={chain}
          graph={graph}
          onClose={() => setSelection(null)}
          periodVolumeUsd={view.volumeUsd}
          selection={selection}
          swaps={view.swaps}
          tokenMap={tokenMap}
        />
      )}
    </FadeInOnView>
  )
}

// ── Header (title + subtitle + range toggle + filters) ─────────────────────

function Header({
  data,
  filtersDirty,
  loading,
  minUsdPerSwap,
  onMinUsdChange,
  onRangeChange,
  onResetFilters,
  onSplitMaxCountChange,
  onSplitThresholdChange,
  range,
  unknownSplitMaxCount,
  unknownSplitThresholdUsd,
  view,
}: {
  data: OrderFlowResponse | null
  filtersDirty: boolean
  loading: boolean
  minUsdPerSwap: number
  onMinUsdChange: (v: number) => void
  onRangeChange: (r: OrderFlowRange) => void
  onResetFilters: () => void
  onSplitMaxCountChange: (v: number) => void
  onSplitThresholdChange: (v: number) => void
  range: OrderFlowRange
  unknownSplitMaxCount: number
  unknownSplitThresholdUsd: number
  view: RangeView | null
}) {
  const subtitle = (() => {
    if (loading && !data) return 'Loading order flow…'
    if (!data || !view) return 'No data'
    const swapCount = view.swaps.length.toLocaleString()
    const volume = formatUsdCompact(view.volumeUsd)
    const labeled = formatPct(view.labeledPct)
    // When the 30d data is capped (we hit HARD_CAP before the cutoff), the
    // fetched window is narrower than 30d. Surface that honestly so the
    // user knows the "30d" view is actually e.g. the last 7 days.
    const days =
      data.totals.capped && range === '30d'
        ? Math.max(
            1,
            Math.round((data.fetchedWindow.to - data.fetchedWindow.oldestSwapTs) / 86400)
          )
        : RANGE_DAYS[range]
    const cappedNote =
      data.totals.capped && range === '30d'
        ? ` · last ${days}d (cap reached)`
        : ''
    return `${swapCount} swaps · ${volume} volume · ${labeled} labeled${cappedNote}`
  })()

  return (
    <Flex
      align={{ base: 'flex-start', md: 'center' }}
      direction={{ base: 'column', md: 'row' }}
      gap="sm"
      justify="space-between"
    >
      <VStack align="flex-start" spacing="xs">
        <Heading size="h5">Order flow</Heading>
        <Text color="font.secondary" fontSize="xs">
          {subtitle}
        </Text>
      </VStack>
      <HStack spacing="sm">
        <ButtonGroup isAttached size="sm" variant="outline">
          {(['24h', '7d', '30d'] as const).map(r => (
            <Button
              key={r}
              onClick={() => onRangeChange(r)}
              variant={r === range ? 'solid' : 'outline'}
            >
              {r}
            </Button>
          ))}
        </ButtonGroup>
        <FilterPopover
          dirty={filtersDirty}
          minUsdPerSwap={minUsdPerSwap}
          onMinUsdChange={onMinUsdChange}
          onReset={onResetFilters}
          onSplitMaxCountChange={onSplitMaxCountChange}
          onSplitThresholdChange={onSplitThresholdChange}
          unknownSplitMaxCount={unknownSplitMaxCount}
          unknownSplitThresholdUsd={unknownSplitThresholdUsd}
        />
      </HStack>
    </Flex>
  )
}

// ── Filter popover (min USD, unknown-split tuning) ─────────────────────────

function FilterPopover({
  dirty,
  minUsdPerSwap,
  onMinUsdChange,
  onReset,
  onSplitMaxCountChange,
  onSplitThresholdChange,
  unknownSplitMaxCount,
  unknownSplitThresholdUsd,
}: {
  dirty: boolean
  minUsdPerSwap: number
  onMinUsdChange: (v: number) => void
  onReset: () => void
  onSplitMaxCountChange: (v: number) => void
  onSplitThresholdChange: (v: number) => void
  unknownSplitMaxCount: number
  unknownSplitThresholdUsd: number
}) {
  return (
    <Popover isLazy placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative">
          <Tooltip hasArrow label="Filter order flow" openDelay={300}>
            <IconButton
              aria-label="Filter order flow"
              icon={<Sliders size={16} />}
              size="sm"
              variant={dirty ? 'solid' : 'outline'}
            />
          </Tooltip>
        </Box>
      </PopoverTrigger>
      <PopoverContent w="320px">
        <PopoverArrow bg="background.level3" />
        <PopoverCloseButton top="sm" />
        <PopoverBody p="md">
          <VStack align="stretch" spacing="md">
            {/* Right padding clears the absolute-positioned close button
                so the "Filters" eyebrow + Reset link don't sit underneath
                the X glyph. */}
            <HStack align="center" pr="lg" spacing="sm">
              <Text
                background="font.special"
                backgroundClip="text"
                fontSize="xs"
                variant="eyebrow"
              >
                Filters
              </Text>
              {dirty && (
                <Button h="fit-content" onClick={onReset} size="xs" variant="link">
                  Reset
                </Button>
              )}
            </HStack>

            <FilterSlider
              ariaLabel="slider-min-usd"
              format={formatUsdCompact}
              hint="Dust filter — swaps below this USD value are excluded from the chart."
              label="Min swap value"
              max={MIN_USD_SLIDER_MAX}
              min={0}
              onCommit={onMinUsdChange}
              step={25}
              value={minUsdPerSwap}
            />

            <FilterSlider
              ariaLabel="slider-split-threshold"
              format={formatUsdCompact}
              hint="Unknown senders whose total flow exceeds this value get their own node in the chart."
              label="Unknown contributor threshold"
              max={MIN_USD_SLIDER_MAX * 4}
              min={50}
              onCommit={onSplitThresholdChange}
              step={50}
              value={unknownSplitThresholdUsd}
            />

            <FilterSlider
              ariaLabel="slider-split-count"
              format={n => `${n}`}
              hint="Cap on how many unknown contributors get their own node. The rest roll up into the Unknown bucket."
              label="Max contributors shown"
              max={SPLIT_COUNT_SLIDER_MAX}
              min={SPLIT_COUNT_SLIDER_MIN}
              onCommit={onSplitMaxCountChange}
              step={1}
              value={unknownSplitMaxCount}
            />
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

/** Slider with a label + value badge. Holds a local draft so dragging
 *  updates the thumb position in real time without rebuilding the Sankey
 *  on every pixel — the parent only sees the value on drag end. */
function FilterSlider({
  ariaLabel,
  format,
  hint,
  label,
  max,
  min,
  onCommit,
  step,
  value,
}: {
  ariaLabel: string
  format: (n: number) => string
  hint: string
  label: string
  max: number
  min: number
  onCommit: (v: number) => void
  step: number
  value: number
}) {
  const [draft, setDraft] = useState<number>(value)
  const draggingRef = useRef<boolean>(false)
  // Reflect external changes (parent reset, TVL-derived default) into the
  // local draft. Skip when the user is actively dragging — otherwise the
  // sync would yank the thumb out from under their gesture.
  useEffect(() => {
    if (!draggingRef.current) setDraft(value)
  }, [value])
  return (
    <VStack align="stretch" spacing="xs" w="full">
      <HStack justify="space-between" w="full">
        <Tooltip hasArrow label={hint} openDelay={300} placement="top">
          <Text fontSize="sm" fontWeight="medium">
            {label}
          </Text>
        </Tooltip>
        <Text color="font.secondary" fontSize="sm">
          {format(draft)}
        </Text>
      </HStack>
      <Slider
        aria-label={ariaLabel}
        max={max}
        min={min}
        onChange={v => {
          draggingRef.current = true
          setDraft(v)
        }}
        onChangeEnd={v => {
          draggingRef.current = false
          setDraft(v)
          onCommit(v)
        }}
        step={step}
        value={draft}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </VStack>
  )
}

// ── Legend (category share stacked above the Sankey) ───────────────────────

function CategoryLegend({
  graph,
}: {
  graph: NonNullable<ReturnType<typeof buildSankeyGraph>>
}) {
  return (
    <HStack flexWrap="wrap" spacing={4}>
      {LEGEND_ORDER.flatMap(cat => {
        const share = graph.categoryShare[cat]
        if (!share || share.pct <= 0) return []
        return [
          <HStack key={cat} spacing={2}>
            <Box bg={CATEGORY_COLORS[cat]} h={3} rounded="sm" w={3} />
            <Text color="font.secondary" fontSize="xs">
              {formatCategory(cat)} {formatPct(share.pct)}
            </Text>
          </HStack>,
        ]
      })}
    </HStack>
  )
}

// ── Body (loading / error / empty / Sankey) ────────────────────────────────

function Body({
  loading,
  error,
  data,
  graph,
  minUsdPerSwap,
  tokenMap,
  view,
  onSelect,
}: {
  loading: boolean
  error: OrderFlowError | null
  data: OrderFlowResponse | null
  graph: ReturnType<typeof buildSankeyGraph> | null
  minUsdPerSwap: number
  tokenMap: TokenMap
  view: RangeView | null
  onSelect: (sel: SankeySelection) => void
}) {
  if (loading && !data) {
    return (
      <CenteredMessage>
        <Spinner color="font.linkHover" size="lg" thickness="3px" />
        <Text color="font.secondary" fontSize="sm">
          Loading order flow…
        </Text>
      </CenteredMessage>
    )
  }
  if (error) {
    return <ErrorMessage error={error} />
  }
  if (!data || !view) {
    return (
      <CenteredMessage>
        <Text color="font.secondary" fontSize="sm">
          No data
        </Text>
      </CenteredMessage>
    )
  }
  if (view.swaps.length < MIN_SWAPS_FOR_RENDER) {
    return (
      <CenteredMessage>
        <Text color="font.secondary" fontSize="sm">
          Not enough swap volume in this period to render order flow.
        </Text>
        <Text color="font.secondary" fontSize="xs" opacity={0.7}>
          ({view.swaps.length} swap{view.swaps.length === 1 ? '' : 's'} found)
        </Text>
      </CenteredMessage>
    )
  }
  if (!graph || graph.nodes.length === 0) {
    return (
      <CenteredMessage>
        <Text color="font.secondary" fontSize="sm">
          All swaps in this period are below the {formatUsdCompact(minUsdPerSwap)} dust filter.
        </Text>
      </CenteredMessage>
    )
  }
  return (
    <PoolOrderFlowSankey
      graph={graph}
      onSelect={onSelect}
      periodVolumeUsd={view.volumeUsd}
      tokenMap={tokenMap}
    />
  )
}

function ErrorMessage({ error }: { error: OrderFlowError }) {
  // Rate-limit errors get an explicit "wait and retry" call-to-action since
  // the user can resolve them themselves. The route ships a copy-ready
  // `userMessage` for this case; we still render a second line nudging the
  // user toward the next step. Other errors fall back to a generic message
  // — those are bugs/outages and we don't want to imply "retry will fix it".
  const isRateLimit = error.code === 'rate_limited'
  const isUpstreamDown =
    error.code === 'upstream_unreachable' || error.code === 'upstream_error'

  const headline = isRateLimit
    ? error.userMessage ?? 'Balancer API rate limit reached.'
    : isUpstreamDown
      ? 'The Balancer API is temporarily unavailable.'
      : 'Unable to load order flow.'

  const subline = isRateLimit
    ? 'This is a per-IP limit on the upstream API. Wait about a minute, then refresh the page.'
    : isUpstreamDown
      ? 'This is an upstream outage, not a problem with your connection. Try again in a few minutes.'
      : `Details: ${error.message}`

  return (
    <CenteredMessage>
      <Text color="font.secondary" fontSize="sm">
        {headline}
      </Text>
      <Text color="font.secondary" fontSize="xs" maxW="md" opacity={0.7}>
        {subline}
      </Text>
    </CenteredMessage>
  )
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      align="center"
      direction="column"
      gap="sm"
      h="full"
      justify="center"
      textAlign="center"
    >
      {children}
    </Flex>
  )
}
