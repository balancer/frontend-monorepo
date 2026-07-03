'use client'

/**
 * Compare-mode panel (POOL_EXPLORER_DESIGN.md §7.4 · Phase E).
 *
 * Two cursors are managed in `PoolPageView`. This component receives the
 * pair plus the event timeline + daily metric snapshots and renders:
 *
 *   - **Window header** — A/B dates + duration
 *   - **Metric deltas** — TVL start/end + Δ%, volume sum, fees sum over
 *     the inclusive window
 *   - **Param diff** — only the tracked parameters that actually changed
 *     between cursors A and B (`diffSnapshots`)
 *
 * When only cursor A is set, the panel becomes a small arming hint
 * ("click another point to compare"). When neither is set the page
 * doesn't mount the toolbar at all.
 */
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import type { PoolParamEvent } from '@analytics/lib/pool-events/types'
import {
  computeParamSnapshot,
  diffSnapshots,
  interpolateTvl,
  sumWindow,
  type MetricSnapshot,
  type ParamChange,
  type ParamSnapshot,
} from '@analytics/lib/pool-events/snapshot-at'

const usdFull = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    n || 0
  )

const usdCompact = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n || 0)

const dateFmt = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

// Reused from PoolStatePanel — kept local so the panel stays self-
// contained and so changes here can't ripple into the right-rail
// formatting unexpectedly.
function formatPercent(value: string | undefined): string {
  if (value === undefined) return '—'
  const n = Number(value) / 1e18
  if (!Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(4).replace(/\.?0+$/, '')}%`
}

// V3 + V2 stable pools have historically used precision = 1000. Without the
// helper-contract precision in scope (the event args don't carry it), this
// is the right display for every pool we serve today. If a future pool
// ships with a different precision, the *raw* value still gives the
// correct delta direction; only the absolute scale would be off.
function formatAmp(value: string | undefined): string {
  if (value === undefined) return '—'
  const n = Number(value) / 1000
  if (!Number.isFinite(n)) return value
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatBool(v: boolean | undefined): string {
  if (v === undefined) return '—'
  return v ? 'on' : 'off'
}

function formatChange(c: ParamChange): { before: string; after: string } {
  if (c.key === 'paused' || c.key === 'recoveryMode') {
    return {
      before: formatBool(c.before as boolean | undefined),
      after: formatBool(c.after as boolean | undefined),
    }
  }
  if (c.key === 'ampValue') {
    return {
      before: formatAmp(c.before as string | undefined),
      after: formatAmp(c.after as string | undefined),
    }
  }
  return {
    before: formatPercent(c.before as string | undefined),
    after: formatPercent(c.after as string | undefined),
  }
}

const CATEGORY_COLOR: Record<ParamChange['category'], string> = {
  fee: 'rgba(37, 226, 164, 0.95)',
  amp: 'rgba(245, 158, 11, 0.95)',
  state: 'rgba(220, 38, 38, 0.95)',
  surge: 'rgba(159, 149, 240, 0.95)',
}

function MetricTile({
  label,
  value,
  delta,
  positiveIsGood,
}: {
  label: string
  value: string
  delta?: { pct: number; absolute: string }
  positiveIsGood?: boolean
}): React.JSX.Element {
  const color = delta
    ? delta.pct >= 0
      ? positiveIsGood === false
        ? 'red.400'
        : 'green.400'
      : positiveIsGood === false
        ? 'green.400'
        : 'red.400'
    : undefined
  return (
    <Box>
      <Text color="font.secondary" fontSize="xs" mb="2xs">
        {label}
      </Text>
      <Text fontFamily="mono" fontSize="lg">
        {value}
      </Text>
      {delta && (
        <HStack mt="2xs" spacing="xs">
          <Text color={color} fontFamily="mono" fontSize="xs">
            {delta.pct >= 0 ? '+' : ''}
            {delta.pct.toFixed(2)}%
          </Text>
          <Text color="font.secondary" fontFamily="mono" fontSize="2xs">
            {delta.absolute}
          </Text>
        </HStack>
      )}
    </Box>
  )
}

function ArmingHint({
  cursorA,
  onClear,
}: {
  cursorA: number
  onClear: () => void
}): React.JSX.Element {
  return (
    <Card overflow="hidden" p={{ base: 'sm', md: 'md' }} variant="level1">
      <Flex
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap="sm"
        justify="space-between"
      >
        <VStack align="flex-start" spacing="xs">
          <Heading size="h5">Comparison armed</Heading>
          <Text color="font.secondary" fontSize="sm">
            Cursor A set at {dateFmt.format(new Date(cursorA * 1000))}. Click another point on the
            chart to compare.
          </Text>
        </VStack>
        <Button onClick={onClear} size="sm" variant="tertiary">
          Clear
        </Button>
      </Flex>
    </Card>
  )
}

export function CompareModeToolbar({
  cursorA,
  cursorB,
  events,
  snapshots,
  onClear,
}: {
  cursorA: number | null
  cursorB: number | null
  events: readonly PoolParamEvent[]
  snapshots: readonly MetricSnapshot[]
  onClear: () => void
}): React.JSX.Element | null {
  // Normalize order so derived state is always (lo, hi) regardless of
  // which cursor was placed first.
  const [lo, hi] = useMemo(() => {
    if (cursorA !== null && cursorB !== null) {
      return cursorA <= cursorB ? [cursorA, cursorB] : [cursorB, cursorA]
    }
    return [cursorA, cursorB]
  }, [cursorA, cursorB])

  const snapshotA: ParamSnapshot | null = useMemo(
    () => (lo !== null ? computeParamSnapshot(events, lo) : null),
    [events, lo]
  )
  const snapshotB: ParamSnapshot | null = useMemo(
    () => (hi !== null ? computeParamSnapshot(events, hi) : null),
    [events, hi]
  )

  const diff = useMemo(
    () => (snapshotA && snapshotB ? diffSnapshots(snapshotA, snapshotB) : []),
    [snapshotA, snapshotB]
  )

  const metrics = useMemo(() => {
    if (lo === null || hi === null) return null
    const tvlA = interpolateTvl(snapshots, lo)
    const tvlB = interpolateTvl(snapshots, hi)
    const tvlPct = tvlA > 0 ? ((tvlB - tvlA) / tvlA) * 100 : 0
    return {
      tvlA,
      tvlB,
      tvlPct,
      tvlAbsolute: (tvlB - tvlA >= 0 ? '+' : '') + usdCompact(tvlB - tvlA),
      volume: sumWindow(snapshots, lo, hi, 'volume24h'),
      fees: sumWindow(snapshots, lo, hi, 'fees24h'),
      days: Math.max(1, Math.round((hi - lo) / 86400)),
    }
  }, [snapshots, lo, hi])

  if (cursorA === null && cursorB === null) return null
  if (lo === null || hi === null) {
    // Only one cursor placed.
    const only = cursorA ?? cursorB
    if (only === null) return null
    return <ArmingHint cursorA={only} onClear={onClear} />
  }
  if (!metrics || !snapshotA || !snapshotB) return null

  return (
    <Card overflow="hidden" p={{ base: 'sm', md: 'md' }} variant="level1">
      <VStack align="stretch" spacing="md">
        <Flex
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap="sm"
          justify="space-between"
        >
          <VStack align="flex-start" spacing="xs">
            <Heading size="h5">Compare A → B</Heading>
            <Text color="font.secondary" fontSize="xs">
              {dateFmt.format(new Date(lo * 1000))} → {dateFmt.format(new Date(hi * 1000))} ·{' '}
              {metrics.days.toLocaleString()} day{metrics.days === 1 ? '' : 's'}
            </Text>
          </VStack>
          <Button onClick={onClear} size="sm" variant="tertiary">
            Clear
          </Button>
        </Flex>

        <Card p={{ base: 'sm', md: 'md' }} variant="subSection">
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing="md">
            <MetricTile
              delta={{ pct: metrics.tvlPct, absolute: metrics.tvlAbsolute }}
              label="TVL change"
              value={`${usdCompact(metrics.tvlA)} → ${usdCompact(metrics.tvlB)}`}
            />
            <MetricTile label="Volume (window sum)" value={usdFull(metrics.volume)} />
            <MetricTile label="Fees (window sum)" value={usdFull(metrics.fees)} />
          </SimpleGrid>
        </Card>

        <Card p={{ base: 'sm', md: 'md' }} variant="subSection">
          <Text color="font.secondary" fontSize="xs" fontWeight="600" mb="sm" textTransform="uppercase">
            Parameter changes
          </Text>
          {diff.length === 0 ? (
            <Text color="font.secondary" fontSize="sm">
              No tracked parameter changes in this window.
            </Text>
          ) : (
            <Stack divider={<Divider />} spacing="sm">
              {diff.map(change => {
                const { before, after } = formatChange(change)
                return (
                  <Flex
                    align="baseline"
                    flexWrap="wrap"
                    gap="sm"
                    justify="space-between"
                    key={change.key}
                  >
                    <HStack minW={0} spacing="xs">
                      <Box
                        bg={CATEGORY_COLOR[change.category]}
                        borderRadius="full"
                        flexShrink={0}
                        h="8px"
                        w="8px"
                      />
                      <VStack align="flex-start" minW={0} spacing="0">
                        <Text fontSize="xs">{change.label}</Text>
                        <Text fontSize="2xs" opacity={0.7} variant="secondary">
                          {change.hint}
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack
                      flexWrap="wrap"
                      fontFamily="mono"
                      fontSize="sm"
                      justify="flex-end"
                      spacing="xs"
                    >
                      <Badge colorScheme="gray" variant="outline">
                        {before}
                      </Badge>
                      <Text color="font.secondary" fontSize="xs">
                        →
                      </Text>
                      <Badge colorScheme="purple" variant="outline">
                        {after}
                      </Badge>
                    </HStack>
                  </Flex>
                )
              })}
            </Stack>
          )}
        </Card>
      </VStack>
    </Card>
  )
}
