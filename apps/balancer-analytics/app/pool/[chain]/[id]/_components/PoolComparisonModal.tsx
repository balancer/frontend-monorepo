'use client'

/**
 * Side-by-side pool comparison.
 *
 * The "source" half is the pool whose detail page hosts the trigger button —
 * we already have its full `PoolPageData` (snapshots, on-chain state, token
 * list, etc.) in the page payload, so the modal accepts that directly. The
 * "target" half is the pool the user picked in `PoolPickerModal`; for the
 * picker only the explorer's `EnrichedPool` row is in hand, so the target's
 * 30-day snapshots and live parameter state stream in via `useComparisonPool`.
 *
 * What the table shows
 *   - Snapshot stats: TVL, 24h volume, 24h fees (or 24h surplus for CoW),
 *     total APR, holders. Numbers from api-v3 `dynamicData`; deltas are
 *     "target minus source" + relative percent so green/red reads the same
 *     direction across rows.
 *   - 7-day trends: derived from each pool's snapshot series. TVL is a
 *     point-vs-point delta (latest vs ~7 days ago); volume / fees are summed
 *     over the last seven daily buckets. Both halves use the same window so
 *     a "+50% vs same period last week" reading is apples-to-apples.
 *   - Parameter comparison: swap-fee %, aggregate fee %, paused / recovery
 *     flags, amplification (only for stable pools where both pools expose
 *     it). Lives in its own card because the formatting / hint text differs
 *     enough from the metric rows that interleaving them confuses the read.
 *
 * Target on-chain state is fetched from `/api/pool/[chain]/[id]/state` — the
 * route already exists for the source pool's right rail and returns the same
 * shape we render here.
 */

import { GqlPoolTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import {
  Badge,
  Box,
  Card,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Skeleton,
  Spinner,
  Stack,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useMemo } from 'react'
import { ExternalLink } from 'react-feather'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import {
  GqlChain,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import {
  chainToSlugMap,
  getPoolTypeLabel,
} from '@repo/lib/modules/pool/pool.utils'
import type { EnrichedPool } from '@analytics/lib/hooks/usePoolExplorer'
import { useComparisonPool } from '@analytics/lib/hooks/useComparisonPool'
import { PoolTokenPillsLite } from '@analytics/app/_components/PoolTokenPillsLite'
import type {
  StableTypeState,
  UniversalV3State,
  V2BasePoolState,
} from '@analytics/lib/pool-state/read'
import type { PoolDetail, PoolPageData, PoolSnapshot } from '../page'

function formatPoolTypeLabel(t: string): string {
  if (t === GqlPoolTypeValues.Reclamm) return 'AutoRange'
  return getPoolTypeLabel(t as GqlPoolType)
}

const usdCompact = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n || 0)

const num = (n: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0)

const pct = (n: number, digits = 2) => `${(n * 100).toFixed(digits)}%`

function frontendPoolHref(chain: GqlChain, id: string, protocolVersion: number): string {
  const slug = chainToSlugMap[chain] ?? 'ethereum'
  const variant = protocolVersion === 3 ? 'v3' : 'v2'
  return `https://balancer.fi/pools/${slug}/${variant}/${id}`
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

// 1e18-scaled fixed-point percentage → "0.05%". Mirrors PoolStatePanel so the
// modal reads consistently with the right rail.
function formatPercent(value: string | null): string {
  if (value === null || value === undefined) return '—'
  const n = Number(value) / 1e18
  if (!Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(4).replace(/\.?0+$/, '')}%`
}

function formatAmp(value: string | null, precision: string | null): string {
  if (!value) return '—'
  const v = Number(value)
  const p = Number(precision ?? '1000') || 1
  if (!Number.isFinite(v) || !Number.isFinite(p)) return value
  return (v / p).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatBool(v: boolean | null | undefined): string {
  if (v === null || v === undefined) return '—'
  return v ? 'on' : 'off'
}

/** Trailing-7-day window summary derived from a snapshot series. Used by the
 *  comparison table to surface "vs 7d ago" deltas alongside the headline
 *  metrics. We anchor on each pool's *own* latest snapshot rather than a
 *  shared wall-clock cutoff so a pool with stale snapshots still shows
 *  meaningful trend data instead of all zeros. */
type SnapshotLike = {
  timestamp: number
  totalLiquidity: number
  volume24h: number
  fees24h: number
  surplus24h: number
}

function summarize7d(snapshots: readonly SnapshotLike[]): {
  tvl: number
  tvlPrev: number
  tvlPct: number | null
  volume: number
  volumePrev: number
  volumePct: number | null
  fees: number
  feesPrev: number
  feesPct: number | null
  surplus: number
  surplusPrev: number
} {
  if (snapshots.length === 0) {
    return {
      tvl: 0,
      tvlPrev: 0,
      tvlPct: null,
      volume: 0,
      volumePrev: 0,
      volumePct: null,
      fees: 0,
      feesPrev: 0,
      feesPct: null,
      surplus: 0,
      surplusPrev: 0,
    }
  }
  const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp)
  const last = sorted[sorted.length - 1]
  const tvl = last.totalLiquidity
  // Anchor cutoffs on the latest snapshot's timestamp so a 30d series with
  // a delayed tail still produces sane windows.
  const sevenDayCutoff = last.timestamp - 7 * 86400
  const fourteenDayCutoff = last.timestamp - 14 * 86400
  const last7 = sorted.filter(s => s.timestamp > sevenDayCutoff)
  const prev7 = sorted.filter(
    s => s.timestamp > fourteenDayCutoff && s.timestamp <= sevenDayCutoff
  )
  const sevenDaysAgoIdx = sorted.findIndex(s => s.timestamp > sevenDayCutoff)
  const tvlPrev =
    sevenDaysAgoIdx > 0
      ? sorted[sevenDaysAgoIdx - 1].totalLiquidity
      : sorted[0].totalLiquidity
  const sum = (arr: SnapshotLike[], key: 'volume24h' | 'fees24h' | 'surplus24h') =>
    arr.reduce((acc, s) => acc + (s[key] || 0), 0)
  const volume = sum(last7, 'volume24h')
  const volumePrev = sum(prev7, 'volume24h')
  const fees = sum(last7, 'fees24h')
  const feesPrev = sum(prev7, 'fees24h')
  const surplus = sum(last7, 'surplus24h')
  const surplusPrev = sum(prev7, 'surplus24h')
  const ratio = (curr: number, prev: number): number | null =>
    prev > 0 && Number.isFinite(curr) && Number.isFinite(prev)
      ? ((curr - prev) / prev) * 100
      : null
  return {
    tvl,
    tvlPrev,
    tvlPct: ratio(tvl, tvlPrev),
    volume,
    volumePrev,
    volumePct: ratio(volume, volumePrev),
    fees,
    feesPrev,
    feesPct: ratio(fees, feesPrev),
    surplus,
    surplusPrev,
  }
}

/** Delta arrow + colored percent. `positiveIsGood = false` flips the
 *  color logic for metrics where lower is better (e.g. fees paid, in
 *  some readings; we don't currently use that path but reserve it). */
function DeltaPct({
  pct: value,
  positiveIsGood = true,
}: {
  pct: number | null
  positiveIsGood?: boolean
}): React.JSX.Element {
  if (value === null || !Number.isFinite(value)) {
    return (
      <Text color="font.secondary" fontFamily="mono" fontSize="2xs">
        —
      </Text>
    )
  }
  const positive = value >= 0
  const color = positive
    ? positiveIsGood
      ? 'green.400'
      : 'red.400'
    : positiveIsGood
      ? 'red.400'
      : 'green.400'
  return (
    <Text color={color} fontFamily="mono" fontSize="2xs" fontWeight={500}>
      {positive ? '+' : ''}
      {value.toFixed(2)}%
    </Text>
  )
}

function PoolHeader({
  side,
  chain,
  protocolVersion,
  type,
  name,
  address,
  tokens,
  id,
}: {
  side: 'A' | 'B'
  chain: GqlChain
  protocolVersion: number
  type: string
  name: string
  address: string
  id: string
  tokens: { address: string; symbol?: string | null; logoURI?: string | null; weight?: string | null }[]
}): React.JSX.Element {
  const slug = chainToSlugMap[chain] ?? 'ethereum'
  return (
    <Card overflow="hidden" p={{ base: 'sm', md: 'md' }} variant="subSection">
      <VStack align="flex-start" spacing="sm">
        <HStack spacing="xs">
          <Badge fontSize="2xs" px="ms" py="0" rounded="full" variant="outline">
            Pool {side}
          </Badge>
          <NetworkIcon chain={chain} size={4} />
          <Badge fontSize="2xs" px="xs" py="0" rounded="full" variant="outline">
            v{protocolVersion}
          </Badge>
          <Badge fontSize="2xs" px="xs" py="0" rounded="full" textTransform="none" variant="outline">
            {formatPoolTypeLabel(type)}
          </Badge>
        </HStack>
        <PoolTokenPillsLite tokens={tokens} type={type} />
        <VStack align="flex-start" spacing="2xs">
          <Text fontSize="sm" fontWeight={500} noOfLines={2}>
            {name}
          </Text>
          <HStack spacing="xs">
            <Link href={`/pool/${slug}/${id}`} target="_blank">
              <Text color="font.link" fontFamily="mono" fontSize="2xs">
                analytics ↗
              </Text>
            </Link>
            <Link href={frontendPoolHref(chain, id, protocolVersion)} rel="noreferrer" target="_blank">
              <HStack color="font.link" spacing="2xs">
                <Text fontFamily="mono" fontSize="2xs">
                  balancer.fi
                </Text>
                <ExternalLink size={10} />
              </HStack>
            </Link>
          </HStack>
          <Text color="font.secondary" fontFamily="mono" fontSize="2xs">
            {shortAddr(address)}
          </Text>
        </VStack>
      </VStack>
    </Card>
  )
}

/** Single row of the metric comparison table. Renders one label, the source
 *  and target values, and a delta (B − A). Hint shows underneath the label
 *  when present. */
function MetricRow({
  label,
  hint,
  valueA,
  valueB,
  delta,
  trendA,
  trendB,
  loading,
}: {
  label: string
  hint?: string
  valueA: string
  valueB: string
  delta?: { absolute: string; pct: number | null }
  trendA?: React.ReactNode
  trendB?: React.ReactNode
  loading?: boolean
}): React.JSX.Element {
  return (
    <Grid
      alignItems="start"
      gap={{ base: 'sm', md: 'md' }}
      gridTemplateColumns={{ base: '1fr', sm: 'minmax(140px, 1fr) 1fr 1fr 1fr' }}
      py="xs"
    >
      <GridItem>
        <VStack align="flex-start" spacing="0">
          <Text fontSize="xs" letterSpacing="0.02em" textTransform="uppercase">
            {label}
          </Text>
          {hint && (
            <Text color="font.secondary" fontSize="2xs" opacity={0.75}>
              {hint}
            </Text>
          )}
        </VStack>
      </GridItem>
      <GridItem>
        <VStack align="flex-start" spacing="2xs">
          {loading ? (
            <Skeleton h="18px" w="80px" />
          ) : (
            <Text fontFamily="mono" fontSize="sm">
              {valueA}
            </Text>
          )}
          {trendA}
        </VStack>
      </GridItem>
      <GridItem>
        <VStack align="flex-start" spacing="2xs">
          {loading ? (
            <Skeleton h="18px" w="80px" />
          ) : (
            <Text fontFamily="mono" fontSize="sm">
              {valueB}
            </Text>
          )}
          {trendB}
        </VStack>
      </GridItem>
      <GridItem>
        {delta ? (
          loading ? (
            <Skeleton h="18px" w="60px" />
          ) : (
            <VStack align="flex-start" spacing="0">
              <Text fontFamily="mono" fontSize="xs">
                {delta.absolute}
              </Text>
              <DeltaPct pct={delta.pct} />
            </VStack>
          )
        ) : (
          <Text color="font.secondary" fontFamily="mono" fontSize="2xs">
            —
          </Text>
        )}
      </GridItem>
    </Grid>
  )
}

function ColumnHeader({ a, b }: { a: string; b: string }): React.JSX.Element {
  return (
    <Grid
      alignItems="end"
      borderBottom="1px solid"
      borderColor="border.base"
      gap={{ base: 'sm', md: 'md' }}
      gridTemplateColumns={{ base: '1fr', sm: 'minmax(140px, 1fr) 1fr 1fr 1fr' }}
      pb="xs"
    >
      <GridItem />
      <GridItem>
        <Text color="font.secondary" fontSize="2xs" letterSpacing="0.04em" textTransform="uppercase">
          {a}
        </Text>
      </GridItem>
      <GridItem>
        <Text color="font.secondary" fontSize="2xs" letterSpacing="0.04em" textTransform="uppercase">
          {b}
        </Text>
      </GridItem>
      <GridItem>
        <Text color="font.secondary" fontSize="2xs" letterSpacing="0.04em" textTransform="uppercase">
          Δ B − A
        </Text>
      </GridItem>
    </Grid>
  )
}

function deltaUsd(a: number, b: number) {
  const diff = b - a
  const pctChange = a > 0 ? (diff / a) * 100 : null
  return {
    absolute: `${diff >= 0 ? '+' : ''}${usdCompact(diff)}`,
    pct: pctChange,
  }
}

function deltaNum(a: number, b: number) {
  const diff = b - a
  const pctChange = a > 0 ? (diff / a) * 100 : null
  return {
    absolute: `${diff >= 0 ? '+' : ''}${num(diff)}`,
    pct: pctChange,
  }
}

function deltaPct(a: number, b: number) {
  // a, b are decimal APR fractions (e.g. 0.045 = 4.5%). Difference is
  // expressed in percentage points; relative change is the ratio.
  const diffPoints = (b - a) * 100
  const pctChange = a !== 0 ? ((b - a) / a) * 100 : null
  return {
    absolute: `${diffPoints >= 0 ? '+' : ''}${diffPoints.toFixed(2)} pp`,
    pct: pctChange,
  }
}

/** Format an absolute percentage-point delta with adaptive precision so
 *  sub-basis-point differences (e.g. 0.04% vs 0.002%, a 0.038 pp swing)
 *  don't round to "0 pp". Swap fees often sit in the 1–10 bp range, so the
 *  default `toFixed(2)` we use for APR deltas would lie about every fee
 *  change as "+0.00 pp". */
function formatPp(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const sign = n >= 0 ? '+' : ''
  const abs = Math.abs(n)
  if (abs === 0) return '0 pp'
  if (abs < 0.001) return `${sign}${n.toExponential(2)} pp`
  if (abs < 0.01) return `${sign}${n.toFixed(4)} pp`
  if (abs < 0.1) return `${sign}${n.toFixed(3)} pp`
  return `${sign}${n.toFixed(2)} pp`
}

/** Delta between two 1e18-scaled fixed-point fee strings (the on-chain
 *  shape for swap-fee / aggregate-fee percentages). Returns `undefined`
 *  when either side is missing so the row falls back to the placeholder
 *  rather than rendering "+NaN pp". */
function deltaFeePercent(
  aRaw: string | null | undefined,
  bRaw: string | null | undefined
): { absolute: string; pct: number | null } | undefined {
  if (aRaw === null || aRaw === undefined) return undefined
  if (bRaw === null || bRaw === undefined) return undefined
  const a = Number(aRaw) / 1e18
  const b = Number(bRaw) / 1e18
  if (!Number.isFinite(a) || !Number.isFinite(b)) return undefined
  const diffPoints = (b - a) * 100
  const pctChange = a !== 0 ? ((b - a) / a) * 100 : null
  return { absolute: formatPp(diffPoints), pct: pctChange }
}

/** Boolean flags get a textual delta so the column reads either
 *  "no change" or e.g. "→ on". Three-way result: undefined when either
 *  side is unknown, "no change" when equal, "→ on/off" when the flag
 *  flipped. `pct` is null in every case — relative change isn't meaningful
 *  for a boolean. */
function deltaBool(
  a: boolean | null | undefined,
  b: boolean | null | undefined
): { absolute: string; pct: number | null } | undefined {
  if (a === null || a === undefined) return undefined
  if (b === null || b === undefined) return undefined
  if (a === b) return { absolute: 'no change', pct: null }
  return { absolute: `→ ${b ? 'on' : 'off'}`, pct: null }
}

/** Amplification factor delta. Both pools normalize on the same precision
 *  (1000 across every chain we serve today), so divide-and-subtract is
 *  safe. We format with up to 2 decimals to match the value column. */
function deltaAmp(
  aRaw: string | null | undefined,
  aPrecision: string | null | undefined,
  bRaw: string | null | undefined,
  bPrecision: string | null | undefined
): { absolute: string; pct: number | null } | undefined {
  if (!aRaw || !bRaw) return undefined
  const a = Number(aRaw) / (Number(aPrecision ?? '1000') || 1)
  const b = Number(bRaw) / (Number(bPrecision ?? '1000') || 1)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return undefined
  const diff = b - a
  const pctChange = a !== 0 ? ((b - a) / a) * 100 : null
  const sign = diff >= 0 ? '+' : ''
  return {
    absolute: `${sign}${diff.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    pct: pctChange,
  }
}

/** Source-side amp state pulled from `PoolPageData.state`. The page already
 *  fetched it, so we don't need to re-fetch — but the on-chain shape (a
 *  `(value, isUpdating, precision)` triple inside `amplificationParameter`)
 *  differs from the route's wire shape, so we adapt it here to match the
 *  hook's `ComparisonAmpState`. */
function readSourceAmp(state: PoolPageData['state']): {
  amplificationParameter: string | null
  amplificationState: {
    value: string
    precision: string
    isUpdating: boolean
  } | null
} | null {
  const s: StableTypeState | null = state.stable
  if (!s) return null
  const param = s.amplificationParameter
  return {
    amplificationParameter: param?.value ?? null,
    amplificationState: param
      ? {
          value: param.value,
          precision: param.precision,
          isUpdating: param.isUpdating,
        }
      : null,
  }
}

function readSourceUniversal(state: PoolPageData['state']): {
  swapFeePercentage: string | null
  aggregateSwapFeePercentage: string | null
  aggregateYieldFeePercentage: string | null
  isPaused: boolean | null
  isInRecoveryMode: boolean | null
} | null {
  const u: UniversalV3State | null = state.universal
  if (u) {
    return {
      swapFeePercentage: u.swapFeePercentage,
      aggregateSwapFeePercentage: u.aggregateSwapFeePercentage,
      aggregateYieldFeePercentage: u.aggregateYieldFeePercentage,
      isPaused: u.isPaused,
      isInRecoveryMode: u.isInRecoveryMode,
    }
  }
  const v2: V2BasePoolState | null = state.v2Base
  if (v2) {
    return {
      swapFeePercentage: v2.swapFeePercentage,
      aggregateSwapFeePercentage: v2.protocolSwapFeeCache,
      aggregateYieldFeePercentage: v2.protocolYieldFeeCache,
      isPaused: v2.isPaused,
      isInRecoveryMode: v2.isInRecoveryMode ?? false,
    }
  }
  return null
}

type Props = {
  isOpen: boolean
  onClose: () => void
  sourcePool: PoolDetail
  sourceSnapshots: readonly PoolSnapshot[]
  sourceState: PoolPageData['state']
  targetPool: EnrichedPool
}

export function PoolComparisonModal({
  isOpen,
  onClose,
  sourcePool,
  sourceSnapshots,
  sourceState,
  targetPool,
}: Props): React.JSX.Element {
  const target = useComparisonPool(
    isOpen ? (targetPool.chain as GqlChain) : null,
    isOpen ? targetPool.id : null
  )

  const sourceAmp = useMemo(() => readSourceAmp(sourceState), [sourceState])
  const sourceUniversal = useMemo(() => readSourceUniversal(sourceState), [sourceState])

  // Today's headline numbers come from api-v3 — these match exactly what the
  // landing-page explorer table renders, so users see the same "TVL: $X"
  // they clicked into. For the source we sum the snapshot tile's `latest`
  // bucket; for the target we read from the EnrichedPool the picker
  // surfaced (saves a second `poolGetPool` round trip).
  const sourceLatest = useMemo(() => {
    const sorted = [...sourceSnapshots].sort((a, b) => a.timestamp - b.timestamp)
    return sorted.at(-1) ?? null
  }, [sourceSnapshots])

  const sourceMetrics = useMemo(() => {
    const tvl = sourceLatest?.totalLiquidity ?? 0
    const vol = sourceLatest?.volume24h ?? 0
    const fees = sourceLatest?.fees24h ?? 0
    const surplus = sourceLatest?.surplus24h ?? 0
    return { tvl, vol, fees, surplus }
  }, [sourceLatest])

  const targetMetrics = useMemo(() => {
    // dynamicData is the freshest 24h reading on api-v3 (recomputed every
    // few minutes), so we prefer it for the headline. Surplus only lives
    // on the snapshot series — fall back to the latest 24h bucket there.
    const latestSnapshot = [...target.snapshots]
      .sort((a, b) => a.timestamp - b.timestamp)
      .at(-1)
    return {
      tvl: Number(targetPool.dynamicData.totalLiquidity ?? 0),
      vol: Number(targetPool.dynamicData.volume24h ?? 0),
      fees: Number(targetPool.dynamicData.fees24h ?? 0),
      surplus: latestSnapshot?.surplus24h ?? 0,
    }
  }, [targetPool, target.snapshots])

  const sourceApr = useMemo(() => {
    // PoolPageData doesn't carry aprItems — the explorer query does, so for
    // a self-consistent number we use the source pool's snapshots to derive
    // an approximate fee APR (24h fees * 365 / TVL). It matches what the
    // landing page renders for non-staked APR and works for any pool type.
    if (!sourceLatest || sourceLatest.totalLiquidity <= 0) return 0
    return (sourceLatest.fees24h * 365) / sourceLatest.totalLiquidity
  }, [sourceLatest])

  const sourceHolders = 0 // PoolPageData doesn't surface holdersCount.
  const targetApr = targetPool._totalApr
  const targetHolders = targetPool._holders

  const source7d = useMemo(() => summarize7d(sourceSnapshots), [sourceSnapshots])
  const target7d = useMemo(() => summarize7d(target.snapshots), [target.snapshots])

  const sourceIsCowAmm = sourcePool.type === 'COW_AMM'
  const targetIsCowAmm = targetPool.type === 'COW_AMM'

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size={{ base: 'sm', md: '5xl' }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>
          <VStack align="flex-start" spacing="2xs">
            <Text fontSize="lg" fontWeight="bold">
              Pool comparison
            </Text>
            <Text color="font.secondary" fontSize="xs" fontWeight="normal">
              {sourcePool.name} vs {targetPool.name || targetPool.symbol || targetPool.id}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalBody pb={6}>
          <VStack align="stretch" spacing="md">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="md">
              <PoolHeader
                address={sourcePool.address}
                chain={sourcePool.chain}
                id={sourcePool.id}
                name={sourcePool.name}
                protocolVersion={sourcePool.protocolVersion}
                side="A"
                tokens={sourcePool.tokens}
                type={sourcePool.type}
              />
              <PoolHeader
                address={targetPool.address}
                chain={targetPool.chain}
                id={targetPool.id}
                name={targetPool.name}
                protocolVersion={targetPool.protocolVersion}
                side="B"
                tokens={(targetPool.poolTokens ?? []).map(t => ({
                  address: t.address,
                  symbol: t.symbol,
                  logoURI: t.logoURI,
                  weight: t.weight,
                }))}
                type={targetPool.type}
              />
            </SimpleGrid>

            <Card overflow="hidden" p={{ base: 'sm', md: 'md' }} variant="subSection">
              <Heading mb="sm" size="h6">
                Metrics &amp; 24h activity
              </Heading>
              <ColumnHeader a="Pool A" b="Pool B" />
              <Stack divider={undefined} spacing="0">
                <MetricRow
                  delta={deltaUsd(sourceMetrics.tvl, targetMetrics.tvl)}
                  label="TVL"
                  valueA={usdCompact(sourceMetrics.tvl)}
                  valueB={usdCompact(targetMetrics.tvl)}
                />
                <MetricRow
                  delta={deltaUsd(sourceMetrics.vol, targetMetrics.vol)}
                  hint="last 24 hours"
                  label="Volume"
                  valueA={usdCompact(sourceMetrics.vol)}
                  valueB={usdCompact(targetMetrics.vol)}
                />
                {sourceIsCowAmm || targetIsCowAmm ? (
                  <MetricRow
                    delta={deltaUsd(
                      sourceIsCowAmm ? sourceMetrics.surplus : sourceMetrics.fees,
                      targetIsCowAmm ? targetMetrics.surplus : targetMetrics.fees
                    )}
                    hint={
                      sourceIsCowAmm && targetIsCowAmm
                        ? '24h surplus (CoW pools)'
                        : 'CoW surplus vs swap fees — note semantics differ'
                    }
                    label={sourceIsCowAmm && targetIsCowAmm ? 'Surplus' : 'Fees / Surplus'}
                    valueA={usdCompact(sourceIsCowAmm ? sourceMetrics.surplus : sourceMetrics.fees)}
                    valueB={usdCompact(targetIsCowAmm ? targetMetrics.surplus : targetMetrics.fees)}
                  />
                ) : (
                  <MetricRow
                    delta={deltaUsd(sourceMetrics.fees, targetMetrics.fees)}
                    hint="last 24 hours"
                    label="Fees"
                    valueA={usdCompact(sourceMetrics.fees)}
                    valueB={usdCompact(targetMetrics.fees)}
                  />
                )}
                <MetricRow
                  delta={deltaPct(sourceApr, targetApr)}
                  hint="fee-implied for A; total APR for B"
                  label="APR"
                  valueA={pct(sourceApr)}
                  valueB={pct(targetApr)}
                />
                <MetricRow
                  delta={
                    sourceHolders > 0
                      ? deltaNum(sourceHolders, targetHolders)
                      : { absolute: '—', pct: null }
                  }
                  hint={sourceHolders === 0 ? 'A not available' : undefined}
                  label="Holders"
                  valueA={sourceHolders > 0 ? num(sourceHolders) : '—'}
                  valueB={num(targetHolders)}
                />
              </Stack>
            </Card>

            <Card overflow="hidden" p={{ base: 'sm', md: 'md' }} variant="subSection">
              <Flex align="center" justify="space-between" mb="sm">
                <Heading size="h6">7-day trends</Heading>
                {(target.snapshotsLoading) && <Spinner size="xs" />}
              </Flex>
              <ColumnHeader a="Pool A · last 7d" b="Pool B · last 7d" />
              <Stack divider={undefined} spacing="0">
                <MetricRow
                  delta={deltaUsd(source7d.tvl, target7d.tvl)}
                  hint="latest vs ~7 days ago"
                  label="TVL change"
                  loading={target.snapshotsLoading && target.snapshots.length === 0}
                  trendA={
                    <HStack spacing="xs">
                      <Text color="font.secondary" fontFamily="mono" fontSize="2xs">
                        from {usdCompact(source7d.tvlPrev)}
                      </Text>
                      <DeltaPct pct={source7d.tvlPct} />
                    </HStack>
                  }
                  trendB={
                    <HStack spacing="xs">
                      <Text color="font.secondary" fontFamily="mono" fontSize="2xs">
                        from {usdCompact(target7d.tvlPrev)}
                      </Text>
                      <DeltaPct pct={target7d.tvlPct} />
                    </HStack>
                  }
                  valueA={usdCompact(source7d.tvl)}
                  valueB={usdCompact(target7d.tvl)}
                />
                <MetricRow
                  delta={deltaUsd(source7d.volume, target7d.volume)}
                  hint="last 7 days summed"
                  label="Volume 7d"
                  loading={target.snapshotsLoading && target.snapshots.length === 0}
                  trendA={
                    <HStack spacing="xs">
                      <Text color="font.secondary" fontFamily="mono" fontSize="2xs">
                        vs prior 7d
                      </Text>
                      <DeltaPct pct={source7d.volumePct} />
                    </HStack>
                  }
                  trendB={
                    <HStack spacing="xs">
                      <Text color="font.secondary" fontFamily="mono" fontSize="2xs">
                        vs prior 7d
                      </Text>
                      <DeltaPct pct={target7d.volumePct} />
                    </HStack>
                  }
                  valueA={usdCompact(source7d.volume)}
                  valueB={usdCompact(target7d.volume)}
                />
                {sourceIsCowAmm || targetIsCowAmm ? (
                  <MetricRow
                    delta={deltaUsd(
                      sourceIsCowAmm ? source7d.surplus : source7d.fees,
                      targetIsCowAmm ? target7d.surplus : target7d.fees
                    )}
                    hint="last 7 days summed"
                    label={sourceIsCowAmm && targetIsCowAmm ? 'Surplus 7d' : 'Fees / Surplus 7d'}
                    loading={target.snapshotsLoading && target.snapshots.length === 0}
                    valueA={usdCompact(sourceIsCowAmm ? source7d.surplus : source7d.fees)}
                    valueB={usdCompact(targetIsCowAmm ? target7d.surplus : target7d.fees)}
                  />
                ) : (
                  <MetricRow
                    delta={deltaUsd(source7d.fees, target7d.fees)}
                    hint="last 7 days summed"
                    label="Fees 7d"
                    loading={target.snapshotsLoading && target.snapshots.length === 0}
                    trendA={
                      <HStack spacing="xs">
                        <Text color="font.secondary" fontFamily="mono" fontSize="2xs">
                          vs prior 7d
                        </Text>
                        <DeltaPct pct={source7d.feesPct} />
                      </HStack>
                    }
                    trendB={
                      <HStack spacing="xs">
                        <Text color="font.secondary" fontFamily="mono" fontSize="2xs">
                          vs prior 7d
                        </Text>
                        <DeltaPct pct={target7d.feesPct} />
                      </HStack>
                    }
                    valueA={usdCompact(source7d.fees)}
                    valueB={usdCompact(target7d.fees)}
                  />
                )}
              </Stack>
            </Card>

            <Card overflow="hidden" p={{ base: 'sm', md: 'md' }} variant="subSection">
              <Flex align="center" justify="space-between" mb="sm">
                <Heading size="h6">On-chain parameters</Heading>
                {target.stateLoading && <Spinner size="xs" />}
              </Flex>
              <ColumnHeader a="Pool A" b="Pool B" />
              <Stack divider={undefined} spacing="0">
                <MetricRow
                  delta={deltaFeePercent(
                    sourceUniversal?.swapFeePercentage,
                    target.state?.swapFeePercentage
                  )}
                  hint="Vault swap-fee setting"
                  label="Swap fee"
                  loading={target.stateLoading && !target.state}
                  valueA={formatPercent(sourceUniversal?.swapFeePercentage ?? null)}
                  valueB={formatPercent(target.state?.swapFeePercentage ?? null)}
                />
                <MetricRow
                  delta={deltaFeePercent(
                    sourceUniversal?.aggregateSwapFeePercentage,
                    target.state?.aggregateSwapFeePercentage
                  )}
                  hint="protocol share of swap fees"
                  label="Aggregate swap fee"
                  loading={target.stateLoading && !target.state}
                  valueA={formatPercent(sourceUniversal?.aggregateSwapFeePercentage ?? null)}
                  valueB={formatPercent(target.state?.aggregateSwapFeePercentage ?? null)}
                />
                <MetricRow
                  delta={deltaFeePercent(
                    sourceUniversal?.aggregateYieldFeePercentage,
                    target.state?.aggregateYieldFeePercentage
                  )}
                  hint="protocol share of yield"
                  label="Aggregate yield fee"
                  loading={target.stateLoading && !target.state}
                  valueA={formatPercent(sourceUniversal?.aggregateYieldFeePercentage ?? null)}
                  valueB={formatPercent(target.state?.aggregateYieldFeePercentage ?? null)}
                />
                <MetricRow
                  delta={deltaBool(sourceUniversal?.isPaused, target.state?.isPaused)}
                  label="Paused"
                  loading={target.stateLoading && !target.state}
                  valueA={formatBool(sourceUniversal?.isPaused)}
                  valueB={formatBool(target.state?.isPaused)}
                />
                <MetricRow
                  delta={deltaBool(
                    sourceUniversal?.isInRecoveryMode,
                    target.state?.isInRecoveryMode
                  )}
                  hint="exit-only mode"
                  label="Recovery mode"
                  loading={target.stateLoading && !target.state}
                  valueA={formatBool(sourceUniversal?.isInRecoveryMode)}
                  valueB={formatBool(target.state?.isInRecoveryMode)}
                />
                {(sourceAmp || target.amp) && (
                  <MetricRow
                    delta={deltaAmp(
                      sourceAmp?.amplificationState?.value ?? sourceAmp?.amplificationParameter,
                      sourceAmp?.amplificationState?.precision ?? '1000',
                      target.amp?.amplificationState?.value ?? target.amp?.amplificationParameter,
                      target.amp?.amplificationState?.precision ?? '1000'
                    )}
                    hint={
                      sourceAmp?.amplificationState?.isUpdating ||
                      target.amp?.amplificationState?.isUpdating
                        ? 'ramp in progress'
                        : 'stable-pool amp'
                    }
                    label="Amplification"
                    loading={target.stateLoading && !target.state}
                    valueA={formatAmp(
                      sourceAmp?.amplificationState?.value ?? sourceAmp?.amplificationParameter ?? null,
                      sourceAmp?.amplificationState?.precision ?? '1000'
                    )}
                    valueB={formatAmp(
                      target.amp?.amplificationState?.value ?? target.amp?.amplificationParameter ?? null,
                      target.amp?.amplificationState?.precision ?? '1000'
                    )}
                  />
                )}
              </Stack>
            </Card>

            {target.error && (
              <Text color="red.300" fontSize="xs">
                Failed to load target pool state: {target.error.message}
              </Text>
            )}

            <Tooltip
              hasArrow
              label="Numbers are pulled from api-v3 dynamicData (TVL/Volume/Fees), 30-day snapshots (7d window), and live on-chain state via VaultExplorer."
              openDelay={300}
              placement="top"
            >
              <Box>
                <Text color="font.secondary" fontSize="2xs" opacity={0.7} textAlign="center">
                  Source: api-v3 dynamicData + 30d snapshots · on-chain state via VaultExplorer
                </Text>
              </Box>
            </Tooltip>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
