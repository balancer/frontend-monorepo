'use client'

import { GqlPoolTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import {
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import { ChevronRight, ExternalLink, GitBranch, Home } from 'react-feather'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { chainToSlugMap, getPoolTypeLabel } from '@repo/lib/modules/pool/pool.utils'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { usePoolEvents } from '@analytics/lib/hooks/usePoolEvents'
import type { PoolPageData } from '../page'
import { PoolHistoryChart } from './PoolHistoryChart'
import { PoolStatePanel } from './PoolStatePanel'
import { PoolEventLog } from './PoolEventLog'
import { getEventStyle } from './eventStyles'
import { HistoryRangeToggle, type HistoryRange } from './HistoryRangeToggle'
import { CompareModeToolbar } from './CompareModeToolbar'
import { PoolComparisonModal } from './PoolComparisonModal'
import { PoolPickerModal } from './PoolPickerModal'
import { PoolSnapshotTile } from './PoolSnapshotTile'
import { POOL_TYPE_MODULES } from './poolTypeModules'
import { PoolTokenPillsLite } from '@analytics/app/_components/PoolTokenPillsLite'
import type { EnrichedPool } from '@analytics/lib/hooks/usePoolExplorer'

// Mirrors the AutoRange rebrand applied in PoolDetailsCellLite /
// PoolExplorerFilters. The internal `RECLAMM` type string stays untouched
// for API filters and module dispatch — only the UI label is overridden.
function formatPoolTypeLabel(t: string): string {
  if (t === GqlPoolTypeValues.Reclamm) return 'AutoRange'
  return getPoolTypeLabel(t as GqlPoolType)
}

function frontendPoolHref(p: PoolPageData['poolDetail']): string {
  const slug = chainToSlugMap[p.chain] ?? 'ethereum'
  const variant = p.protocolVersion === 3 ? 'v3' : 'v2'
  return `https://balancer.fi/pools/${slug}/${variant}/${p.id}`
}

const PENDING_LABEL: Record<HistoryRange, string> = {
  '30d': '30 days',
  '90d': '90 days',
  '180d': '180 days',
  '1y': '1 year',
  all: 'full history',
}

/** Semi-transparent overlay shown while the server re-renders with a new
 *  `?range=` searchParam. The first widen past 90 days triggers a deep
 *  scan that can run multi-second, so a passive "page froze" is worse
 *  UX than the data taking that long. */
function RangeChangeOverlay({
  pendingRange,
}: {
  pendingRange: HistoryRange | null
}): React.JSX.Element {
  return (
    <Flex
      align="center"
      backdropFilter="blur(2px)"
      bg="background.level0WithOpacity"
      direction="column"
      gap="sm"
      inset={0}
      justify="center"
      position="absolute"
      rounded="md"
      zIndex={2}
    >
      <Spinner color="font.linkHover" size="lg" thickness="3px" />
      <Text color="font.secondary" fontSize="sm">
        Loading {pendingRange ? PENDING_LABEL[pendingRange] : 'range'}…
      </Text>
      <Text color="font.secondary" fontSize="2xs" opacity={0.7} textAlign="center">
        First widen may take a few seconds while the deep scan runs once.
      </Text>
    </Flex>
  )
}

export function PoolPageView({ data }: { data: PoolPageData }): React.JSX.Element {
  const { poolDetail, snapshots, state, range, fullHistory } = data
  // Events stream in client-side instead of blocking the server render.
  // The page used to wait on a multi-second drpc log walk before painting
  // anything; we now show the shell immediately and let the timeline
  // (chart markers + event log) populate when it lands. `data.events`
  // remains in the payload type as an empty array for backwards
  // compatibility, but `events` from the hook is the source of truth.
  const eventsResult = usePoolEvents(poolDetail.chain, poolDetail.id, { fullHistory })
  const eventsLoading = eventsResult.loading

  // Drop fee-category events that fire as part of the pool's creation tx.
  // V3 pool registration emits `SwapFeePercentageChanged` + the aggregate
  // fee events with the *initial* values from inside `Vault.registerPool`,
  // which the UI was rendering as actual fee changes. Filter anything in
  // the `fee` category whose block timestamp is at or before `createTime`
  // — those are the registration-block emissions, not user-driven changes.
  const events = useMemo(() => {
    const createTime = poolDetail.createTime
    if (!createTime) return eventsResult.events
    return eventsResult.events.filter(e => {
      if (e.blockTimestamp > createTime) return true
      return getEventStyle(e.eventName).category !== 'fee'
    })
  }, [eventsResult.events, poolDetail.createTime])

  // Next's App Router scroll-to-top on navigation is unreliable when the
  // route has a `loading.tsx` Suspense boundary — landing on a pool page
  // can keep the previous page's scroll offset. Reset explicitly once the
  // resolved content commits (last writer wins over Next's own attempt).
  // Keyed on pool identity only, so toggling `?range=` doesn't yank the
  // user back to the top while they're reading the chart.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [poolDetail.chain, poolDetail.id])
  const RANGE_LABEL: Record<typeof range, string> = {
    '30d': '30-day history',
    '90d': '90-day history',
    '180d': '180-day history',
    '1y': '1-year history',
    all: 'Full history',
  }
  const RANGE_SUBTITLE: Record<typeof range, string> = {
    '30d': 'last 30 days',
    '90d': 'last 90 days',
    '180d': 'last 180 days',
    '1y': 'last 365 days',
    all: 'since pool creation',
  }

  // Compare-mode cursor state (Phase E). Click cycle:
  //   0 cursors → set A
  //   A only    → set B (toolbar normalizes left/right order)
  //   both set  → restart from clicked timestamp (new A, B clears)
  // The toolbar renders only when at least one cursor is set.
  const [cursors, setCursors] = useState<{ a: number | null; b: number | null }>({
    a: null,
    b: null,
  })
  const handleCursorClick = useCallback((t: number) => {
    setCursors(prev => {
      if (prev.a === null) return { a: t, b: null }
      if (prev.b === null) return { a: prev.a, b: t }
      return { a: t, b: null }
    })
  }, [])
  const clearCursors = useCallback(() => setCursors({ a: null, b: null }), [])

  // Range-navigation pending state. The chart/event payloads only update
  // once the server re-renders with the new searchParam; during that
  // window we keep the old data visible but overlay a "Loading…" notice
  // so the user sees that work is in flight. We track only the *last
  // clicked* range and derive `pendingRange` by comparing it to the
  // current `range` prop — no effect, no setState-during-effect cascade.
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [clickedRange, setClickedRange] = useState<HistoryRange | null>(null)
  const pendingRange: HistoryRange | null =
    clickedRange && clickedRange !== range ? clickedRange : null
  const handleRangeSelect = useCallback(
    (next: HistoryRange) => {
      if (next === range) return
      // Preserve other params (e.g. `?refresh`) but drop the legacy
      // `?fullHistory` alias when we set `?range=`.
      const params = new URLSearchParams(searchParams.toString())
      params.delete('fullHistory')
      if (next === '90d') params.delete('range') // 90d is default — keep URL clean
      else params.set('range', next)
      const qs = params.toString()
      const href = qs ? `${pathname}?${qs}` : pathname
      setClickedRange(next)
      startTransition(() => router.push(href))
    },
    [range, router, pathname, searchParams]
  )
  const isRangeChanging = pendingRange !== null

  // Pool-vs-pool comparison state. The picker opens first; once a target is
  // chosen we close the picker, open the comparison modal, and surface the
  // chosen target as `compareTarget` so the modal can re-render across
  // user-side modal-close cycles without re-fetching the picker list.
  const [pickerOpen, setPickerOpen] = useState(false)
  const [compareTarget, setCompareTarget] = useState<EnrichedPool | null>(null)
  const handleCompareSelect = useCallback((pool: EnrichedPool) => {
    setCompareTarget(pool)
    setPickerOpen(false)
  }, [])
  const closeComparison = useCallback(() => setCompareTarget(null), [])

  return (
    <DefaultPageContainer pb="2xl" pt={['md', 'lg']}>
      <VStack align="stretch" spacing={{ base: 'lg', md: 'xl' }}>
        {/* Mini breadcrumb — Home → Pools → this pool. Mirrors
            frontend-v3 `PoolBreadcrumbs` so analytics users feel at home
            in the same nav grammar. The home target is `/` (analytics
            landing) and the Pools anchor jumps to the explorer section
            on the landing page. */}
        <FadeInOnView animateOnce={false}>
          <Breadcrumb
            color="font.secondary"
            fontSize="sm"
            separator={
              <Box color="border.base">
                <ChevronRight size={14} />
              </Box>
            }
            spacing="sm"
          >
            <BreadcrumbItem>
              <BreadcrumbLink
                _hover={{ color: 'font.linkHover' }}
                as={Link}
                href="/"
              >
                <Home size={14} />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink
                _hover={{ color: 'font.linkHover' }}
                as={Link}
                href="/#pools"
              >
                Pools
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink color="font.primary" cursor="default" href="#">
                {poolDetail.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <Stack
            align={{ base: 'flex-start', lg: 'flex-end' }}
            direction={{ base: 'column', lg: 'row' }}
            justify="space-between"
            spacing="md"
            w="full"
          >
            <VStack align="flex-start" minW={0} spacing="sm">
              {/* Meta badges row — chain icon, protocol version, token
                  pills (with logos), pool type. Mirrors frontend-v3's
                  PoolMetaBadges (PoolHeader.tsx) including the
                  PoolListTokenPills equivalent with overlapping icons
                  for stable pools and weighted-weight chips. */}
              <Flex align="center" flexWrap="wrap" gap={{ base: 'xs', sm: 'sm' }}>
                <NetworkIcon chain={poolDetail.chain} size={6} />
                <Badge fontSize="xs" px="ms" py="2xs" rounded="full" variant="outline">
                  v{poolDetail.protocolVersion}
                </Badge>
                <PoolTokenPillsLite tokens={poolDetail.tokens} type={poolDetail.type} />
                <Badge
                  fontSize="xs"
                  px="ms"
                  py="2xs"
                  rounded="full"
                  textTransform="none"
                  variant="outline"
                >
                  {formatPoolTypeLabel(poolDetail.type)}
                </Badge>
              </Flex>
              <Heading
                size="h3"
                sx={{ textWrap: 'balance' }}
                variant="special"
              >
                {poolDetail.name}
              </Heading>
              <Text fontSize="sm" sx={{ textWrap: 'balance' }} variant="secondary">
                Parameter timeline and impact analysis
              </Text>
            </VStack>
            <HStack spacing="sm">
              <Button
                leftIcon={<GitBranch size={14} />}
                onClick={() => setPickerOpen(true)}
                size="md"
                variant="primary"
              >
                Compare
              </Button>
              <Button
                as={Link}
                href={frontendPoolHref(poolDetail)}
                rel="noreferrer"
                rightIcon={<ExternalLink size={14} />}
                size="md"
                target="_blank"
                variant="primary"
              >
                Balancer.fi
              </Button>
            </HStack>
          </Stack>
        </FadeInOnView>

        {/* Bento: pool snapshot tile (left) + history chart card (right).
            Matches frontend-v3's PoolStatsLayout. Stacks vertically on
            narrow viewports; row layout from md upward with a fixed
            height so the snapshot and chart visually tie together. */}
        <FadeInOnView animateOnce={false}>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            h={{ md: '484px' }}
            spacing="md"
            w="full"
          >
            {/* Snapshot tile narrower (was `md` ≈ 448px) so the chart card —
                the page's primary visual — gets the breathing room it
                deserves. 260px is enough for an h4 USD heading + delta
                pill without wrapping. */}
            <PoolSnapshotTile
              events={events}
              flexShrink={0}
              poolType={poolDetail.type}
              range={range}
              snapshots={snapshots}
              w={{ base: 'full', md: '260px' }}
            />
            <Card flex="1" minW={0} overflow="hidden" variant="level1">
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
                  <Flex
                    align={{ base: 'flex-start', md: 'center' }}
                    direction={{ base: 'column', md: 'row' }}
                    gap="sm"
                    justify="space-between"
                  >
                    <VStack align="flex-start" spacing="xs">
                      <Heading size="h5">{RANGE_LABEL[range]}</Heading>
                      <Flex align="center" gap="xs">
                        <Text color="font.secondary" fontSize="xs">
                          {eventsLoading && events.length === 0
                            ? 'Indexing parameter events…'
                            : `${events.length.toLocaleString()} parameter event${events.length === 1 ? '' : 's'} indexed`}
                          {' · '}
                          {RANGE_SUBTITLE[range]}
                        </Text>
                        {eventsLoading && (
                          <Spinner color="font.secondary" size="xs" thickness="2px" />
                        )}
                      </Flex>
                    </VStack>
                    <HistoryRangeToggle
                      onSelect={handleRangeSelect}
                      pendingRange={pendingRange}
                      range={range}
                    />
                  </Flex>
                  <Box flex="1" minH={0} position="relative">
                    <PoolHistoryChart
                      cursors={cursors}
                      events={events}
                      onCursorClick={handleCursorClick}
                      snapshots={snapshots}
                    />
                    {isRangeChanging && <RangeChangeOverlay pendingRange={pendingRange} />}
                  </Box>
                </VStack>
              </NoisyCard>
            </Card>
          </Stack>
        </FadeInOnView>

        {/* Pool-type-specific modules — driven by a tiny registry so adding
            Autorange / LBP / other type panels next is a one-entry addition
            in `poolTypeModules.tsx` rather than more conditionals here. */}
        {POOL_TYPE_MODULES.map(mod =>
          mod.shouldRender(data) ? (
            <React.Fragment key={mod.key}>{mod.render(data)}</React.Fragment>
          ) : null
        )}

        {/* Current state — full-width card below the chart. */}
        <FadeInOnView animateOnce={false}>
          <PoolStatePanel poolDetail={poolDetail} state={state} />
        </FadeInOnView>

        {(cursors.a !== null || cursors.b !== null) && (
          <FadeInOnView animateOnce={false}>
            <CompareModeToolbar
              cursorA={cursors.a}
              cursorB={cursors.b}
              events={events}
              onClear={clearCursors}
              snapshots={snapshots}
            />
          </FadeInOnView>
        )}

        <FadeInOnView animateOnce={false}>
          <PoolEventLog chain={poolDetail.chain} events={events} loading={eventsLoading} />
        </FadeInOnView>
      </VStack>

      <PoolPickerModal
        currentPool={{
          id: poolDetail.id,
          chain: poolDetail.chain,
          name: poolDetail.name,
        }}
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleCompareSelect}
      />
      {compareTarget && (
        <PoolComparisonModal
          isOpen={compareTarget !== null}
          onClose={closeComparison}
          sourcePool={poolDetail}
          sourceSnapshots={snapshots}
          sourceState={state}
          targetPool={compareTarget}
        />
      )}
    </DefaultPageContainer>
  )
}
