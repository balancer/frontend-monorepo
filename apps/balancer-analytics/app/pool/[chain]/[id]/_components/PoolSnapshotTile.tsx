'use client'

/**
 * Left half of the pool-detail bento — at-a-glance metrics that mirror
 * frontend-v3's `PoolSnapshot`, but range-aware: the headline numbers
 * track whatever range the chart toggle is showing, not just the latest
 * 24h. The chart's `?range=` parameter is the single source of truth;
 * this tile reads the same trimmed `snapshots` array.
 *
 * Per-metric semantics under the active range:
 *   - TVL: current value (stock, not flow). Delta compares latest vs
 *     the first snapshot in the range (so 30d → "TVL +5.2% vs 30d ago").
 *   - Volume / Fees / Surplus: total across the range (flows summed).
 *   - Surplus row replaces Fees on CowAmm pools — CoW pools earn
 *     surplus instead of swap fees.
 */

import {
  Card,
  Divider,
  HStack,
  Heading,
  Stack,
  Text,
  VStack,
  type StackProps,
} from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import type { PoolHistoryRange, PoolPageData } from '../page'
import { getEventStyle } from './eventStyles'

type Ev = PoolPageData['events'][number]

const usdCompact = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n || 0)

// Uniform compact format keeps the tile fits-on-260px clean: even a
// $1.5B pool reads as "$1.5B" rather than "$1,500,000,000".

/** Short label for the range — appears in metric titles ("Volume (30d)").
 *  "all-time" reads natural in copy; the chart toggle's literal "all" would
 *  parse oddly as a metric label. */
const RANGE_LABEL: Record<PoolHistoryRange, string> = {
  '30d': '30d',
  '90d': '90d',
  '180d': '180d',
  '1y': '1y',
  all: 'all-time',
}

/** Human-readable phrasing for the TVL delta hint — "vs 30 days ago" reads
 *  better than "vs 30d ago" at the small caption size. */
const RANGE_DELTA_HINT: Record<PoolHistoryRange, string> = {
  '30d': 'vs 30 days ago',
  '90d': 'vs 90 days ago',
  '180d': 'vs 180 days ago',
  '1y': 'vs 1 year ago',
  all: 'since pool creation',
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
      fontSize="xs"
      fontWeight={500}
    >
      {positive ? '+' : ''}
      {pct.toFixed(2)}%
    </Text>
  )
}

function MetricRow({
  label,
  value,
  delta,
  hint,
}: {
  label: string
  value: string
  delta?: number | null
  hint?: string
}): React.JSX.Element {
  return (
    <VStack align="flex-start" spacing="2xs" w="full">
      <HStack color="font.secondary" spacing="xs">
        <Text fontSize="xs" letterSpacing="0.02em" textTransform="uppercase">
          {label}
        </Text>
        {hint && (
          <Text fontSize="2xs" opacity={0.7}>
            {hint}
          </Text>
        )}
      </HStack>
      <HStack align="baseline" spacing="sm">
        <Heading fontWeight={600} size="h4">
          {value}
        </Heading>
        {delta !== undefined && <DeltaBadge pct={delta} />}
      </HStack>
    </VStack>
  )
}

// Locale-independent DD.MM.YYYY, HH:mm — matches the event log column.
const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`)
function fmtWhen(unixSec: number): string {
  const d = new Date(unixSec * 1000)
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** Last-change row — different shape than the USD metrics (event label
 *  on its own line, timestamp underneath) so we lay it out by hand
 *  instead of reusing `MetricRow`. */
function LastChangeRow({ event }: { event: Ev | null }): React.JSX.Element {
  return (
    <VStack align="flex-start" spacing="2xs" w="full">
      <Text
        color="font.secondary"
        fontSize="xs"
        letterSpacing="0.02em"
        textTransform="uppercase"
      >
        Last parameter change
      </Text>
      {event ? (
        <>
          <HStack align="center" spacing="xs">
            <Text fontSize="md" fontWeight={600}>
              {getEventStyle(event.eventName).legendLabel}
            </Text>
          </HStack>
          <Text color="font.secondary" fontFamily="mono" fontSize="xs">
            {fmtWhen(event.blockTimestamp)}
          </Text>
        </>
      ) : (
        <Text color="font.secondary" fontSize="sm" fontStyle="italic">
          No changes recorded
        </Text>
      )}
    </VStack>
  )
}

export function PoolSnapshotTile({
  snapshots,
  events,
  range,
  poolType,
  ...stackProps
}: {
  snapshots: PoolPageData['snapshots']
  events: PoolPageData['events']
  /** Active chart range — drives metric labels + the range over which
   *  volume/fees/surplus are summed. The page-level `data.snapshots` is
   *  already trimmed to this range, so summing here just walks the
   *  prop. */
  range: PoolHistoryRange
  /** Pool type from api-v3 (e.g. `COW_AMM`, `WEIGHTED`, `STABLE`). Drives
   *  the Fees-vs-Surplus dispatch — CowAmm pools earn surplus instead of
   *  swap fees, so showing zero fees on those is misleading. */
  poolType: string
} & StackProps): React.JSX.Element {
  const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp)
  const latest = sorted.at(-1)
  const first = sorted.at(0)

  const tvl = latest?.totalLiquidity ?? 0
  // Range-aware delta — compare latest snapshot's TVL to the oldest
  // snapshot in the active window. If there's only one snapshot we
  // surface no delta (no comparison point).
  const tvlDelta =
    first && latest && first !== latest ? deltaPct(tvl, first.totalLiquidity) : null

  // Range totals — sum the flows across every snapshot we hold. The
  // 30d view trims to ~30 daily snapshots; "all" gives the full series.
  let volumeTotal = 0
  let feesTotal = 0
  let surplusTotal = 0
  for (const s of sorted) {
    volumeTotal += s.volume24h
    feesTotal += s.fees24h
    surplusTotal += s.surplus24h
  }

  const isCowAmm = poolType === 'COW_AMM'
  const rangeLabel = RANGE_LABEL[range]
  const deltaHint = RANGE_DELTA_HINT[range]

  // Latest tracked param event (max blockTimestamp). Stable+amp pools can
  // have multiple events at the same block — break ties on logIndex too.
  let lastEvent: Ev | null = null
  for (const e of events) {
    if (
      !lastEvent ||
      e.blockTimestamp > lastEvent.blockTimestamp ||
      (e.blockTimestamp === lastEvent.blockTimestamp && e.logIndex > lastEvent.logIndex)
    ) {
      lastEvent = e
    }
  }

  return (
    <Card overflow="hidden" position="relative" {...stackProps}>
      <NoisyCard
        cardProps={{ height: 'full', overflow: 'hidden' }}
        contentProps={{ display: 'flex' }}
      >
        <Stack
          align="stretch"
          divider={<Divider opacity={0.4} />}
          h="full"
          p={{ base: 'md', md: 'lg' }}
          spacing="md"
          w="full"
        >
          <Heading size="h5">Metrics</Heading>
          <MetricRow
            delta={tvlDelta}
            hint={deltaHint}
            label="TVL"
            value={usdCompact(tvl)}
          />
          <MetricRow
            hint={`total ${rangeLabel}`}
            label="Volume"
            value={usdCompact(volumeTotal)}
          />
          {isCowAmm ? (
            <MetricRow
              hint={`total ${rangeLabel}`}
              label="Surplus"
              value={usdCompact(surplusTotal)}
            />
          ) : (
            <MetricRow
              hint={`total ${rangeLabel}`}
              label="Fees"
              value={usdCompact(feesTotal)}
            />
          )}
          <LastChangeRow event={lastEvent} />
        </Stack>
      </NoisyCard>
    </Card>
  )
}
