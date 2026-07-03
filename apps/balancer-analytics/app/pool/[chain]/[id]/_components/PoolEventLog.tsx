'use client'

import {
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { PaginatedTable } from '@repo/lib/shared/components/tables/PaginatedTable'
import { getPaginationProps } from '@repo/lib/shared/components/pagination/getPaginationProps'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import type { PoolParamEvent } from '@analytics/lib/pool-events/types'
import { CATEGORY_ORDER, getEventStyle, type EventCategory } from './eventStyles'
import { formatEventArgValue } from './formatEventArgs'
import { getBlockExplorerTxUrl } from '@analytics/lib/networks/chain-info'

// Compact fixed-width DD.MM.YYYY, HH:mm — locale-independent, mono-friendly,
// dates line up cleanly down the column. Intl's locale formatting can drift
// between "Sep 22 2026, 12:01 PM" / "22 Sept 12:01" / etc. depending on
// browser locale; this hand-rolled formatter keeps the visual stable.
const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`)
function fmtWhen(unixSec: number): string {
  const d = new Date(unixSec * 1000)
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}
// Full timestamp for the hover tooltip — includes seconds + locale wording
// so power users can copy a precise time from the title attribute.
const dateFullFmt = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
})

function shortHash(h: string): string {
  return `${h.slice(0, 8)}…${h.slice(-6)}`
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  fee: 'Fees',
  amp: 'Amp',
  state: 'Pause / recovery',
  surge: 'Surge',
  rate: 'Rate',
  registration: 'Registration',
  other: 'Other',
}

// One representative color per category — pulled from the per-event
// palette in `eventStyles.ts` so the chip color matches what users see on
// the pins and the row dots for events in that category.
const CATEGORY_COLOR: Record<EventCategory, string> = {
  fee: '#7c6ff5',
  amp: '#f59e0b',
  state: '#ef4444',
  surge: '#ec4899',
  rate: '#10b981',
  registration: '#64748b',
  other: '#94a3b8',
}

// Above this many present categories, the chip strip switches to a
// dropdown to stay compact. Pools with ≤ this many keep the at-a-glance
// inline strip.
const INLINE_CHIP_THRESHOLD = 4

// Responsive grid columns mirror the PoolExplorer pattern: same template
// for header and body, with `minmax(0, 1fr)` on Args so it absorbs
// leftover horizontal space gracefully. On `base` we collapse to a single
// stacked column (see `EventRow` below) so narrow viewports don't need
// horizontal scroll just to read one event.
const GRID_COLS = {
  base: '1fr',
  // 180px gives `DD.MM.YYYY, HH:mm` mono enough room at the larger row font
  // without wrapping; 150px keeps the truncated tx hash on one line.
  md: '180px 220px minmax(0, 1fr) 150px',
}

// ── Category filter widgets ───────────────────────────────────────────
// Both share the same toggle semantics: each category is independently ON
// (default) or OFF (in `disabled`); click flips. The inline chip strip is
// used for compact pools; the dropdown takes over above
// `INLINE_CHIP_THRESHOLD` so the header doesn't sprawl into a 6+ chip wall.

function CategoryChip({
  cat,
  count,
  enabled,
  onToggle,
}: {
  cat: EventCategory
  count: number
  enabled: boolean
  onToggle: (cat: EventCategory) => void
}): React.JSX.Element {
  const color = CATEGORY_COLOR[cat]
  return (
    <Flex
      _hover={{ borderColor: color, opacity: 1 }}
      align="center"
      bg={enabled ? `${color}1f` : 'transparent'}
      border="1px solid"
      borderColor={enabled ? color : 'border.base'}
      color={enabled ? 'font.primary' : 'font.secondary'}
      cursor="pointer"
      fontSize="xs"
      gap="xs"
      onClick={() => onToggle(cat)}
      opacity={enabled ? 1 : 0.6}
      px="ms"
      py="2xs"
      role="button"
      rounded="full"
      transition="all 0.15s"
      userSelect="none"
    >
      <Box bg={color} borderRadius="full" h="6px" w="6px" />
      <Text fontWeight="500">{CATEGORY_LABELS[cat]}</Text>
      <Text fontFamily="mono" fontSize="2xs" opacity={0.7}>
        ×{count}
      </Text>
    </Flex>
  )
}

function CategoryFilterMenu({
  present,
  disabled,
  countByCategory,
  onToggle,
  onReset,
}: {
  present: EventCategory[]
  disabled: Set<EventCategory>
  countByCategory: Map<EventCategory, number>
  onToggle: (cat: EventCategory) => void
  onReset: () => void
}): React.JSX.Element {
  const activeCount = present.length - disabled.size
  const allActive = disabled.size === 0
  return (
    <HStack spacing="xs">
      <Menu closeOnSelect={false}>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          size="sm"
          variant="tertiary"
        >
          {allActive
            ? `All categories (${present.length})`
            : `${activeCount} of ${present.length} categories`}
        </MenuButton>
        <MenuList minW="220px" zIndex="popover">
          {present.map(cat => {
            const enabled = !disabled.has(cat)
            return (
              <MenuItem key={cat} onClick={() => onToggle(cat)}>
                <Flex align="center" gap="sm" w="full">
                  <Checkbox isChecked={enabled} pointerEvents="none" />
                  <Box bg={CATEGORY_COLOR[cat]} borderRadius="full" h="8px" w="8px" />
                  <Text flex="1" fontSize="sm">
                    {CATEGORY_LABELS[cat]}
                  </Text>
                  <Text color="font.secondary" fontFamily="mono" fontSize="xs">
                    {countByCategory.get(cat) ?? 0}
                  </Text>
                </Flex>
              </MenuItem>
            )
          })}
        </MenuList>
      </Menu>
      {!allActive && (
        <Button onClick={onReset} size="sm" variant="ghost">
          Reset
        </Button>
      )}
    </HStack>
  )
}

function ArgList({ args }: { args: Record<string, string | number | boolean> }): React.JSX.Element {
  const entries = Object.entries(args)
  if (entries.length === 0) {
    return (
      <Text color="font.secondary" fontSize="sm">
        —
      </Text>
    )
  }
  // On `md+` flow args inline on a single wrapping line — `key=value` pairs
  // with a `·` separator. Single-arg events become one tight line; even amp
  // ramps (4 args) stay one short line on a wide viewport. On `base` we
  // keep the stacked key-above-value layout so long values don't overflow
  // a phone screen.
  return (
    <Box>
      <Flex
        align={{ base: 'flex-start', md: 'baseline' }}
        columnGap="sm"
        direction={{ base: 'column', md: 'row' }}
        flexWrap={{ base: 'nowrap', md: 'wrap' }}
        rowGap="2xs"
      >
        {entries.map(([k, v], i) => (
          <Flex
            align={{ base: 'flex-start', md: 'baseline' }}
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: '2xs', md: 'xs' }}
            key={k}
          >
            <Text color="font.secondary" fontSize="xs">
              {k}
            </Text>
            <Text fontFamily="mono" fontSize="sm" wordBreak="break-word">
              {formatEventArgValue(k, v)}
              {i < entries.length - 1 && (
                <Text
                  as="span"
                  color="font.secondary"
                  display={{ base: 'none', md: 'inline' }}
                  ml="sm"
                  opacity={0.4}
                >
                  ·
                </Text>
              )}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}

function EventHeader(): React.JSX.Element {
  // Hidden on `base` — stacked rows carry their own inline labels so a
  // sticky column header would just steal vertical space on phones.
  return (
    <Grid
      alignItems="center"
      borderBottom="1px solid"
      borderColor="border.base"
      display={{ base: 'none', md: 'grid' }}
      gap="ms"
      gridTemplateColumns={GRID_COLS}
      px={{ base: 'md', md: 'lg' }}
      py="sm"
      w="full"
    >
      <GridItem>
        <Text color="font.secondary" fontSize="sm" fontWeight="bold">
          When
        </Text>
      </GridItem>
      <GridItem>
        <Text color="font.secondary" fontSize="sm" fontWeight="bold">
          Event
        </Text>
      </GridItem>
      <GridItem>
        <Text color="font.secondary" fontSize="sm" fontWeight="bold">
          Arguments
        </Text>
      </GridItem>
      <GridItem justifySelf="end">
        <Text color="font.secondary" fontSize="sm" fontWeight="bold">
          Tx
        </Text>
      </GridItem>
    </Grid>
  )
}

/** Inline label shown above each field on `base` viewports only. Hidden on
 *  `md+` where the sticky column header carries the labels instead. */
function MobileLabel({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <Text
      color="font.secondary"
      display={{ base: 'block', md: 'none' }}
      fontSize="xs"
      fontWeight="bold"
      mb="2xs"
      textTransform="uppercase"
    >
      {children}
    </Text>
  )
}

function EventRow({
  event,
  index,
  chain,
}: {
  event: PoolParamEvent
  index: number
  /** Source of truth for the tx-explorer URL. Resolved per-row via the
   *  shared `getBlockExplorerTxUrl` so any chain whose explorer is in
   *  `packages/lib/config/networks/*.ts` Just Works without a local map. */
  chain: GqlChain
}): React.JSX.Element {
  const style = getEventStyle(event.eventName)
  return (
    <Box
      _hover={{ bg: 'background.level0' }}
      borderColor="border.base"
      borderTop={index === 0 ? undefined : '1px solid'}
      transition="background 0.15s"
      w="full"
    >
      <Grid
        alignItems="center"
        gap={{ base: 'sm', md: 'ms' }}
        gridTemplateColumns={GRID_COLS}
        px={{ base: 'md', md: 'lg' }}
        py="xs"
        w="full"
      >
        <GridItem>
          <MobileLabel>When</MobileLabel>
          {/* Mono so the fixed-width DD.MM.YYYY, HH:mm aligns down the
              column; left-aligned on base where the row is stacked,
              left-aligned on md+ since the column is already at the
              start of the row. */}
          <Text
            fontFamily="mono"
            fontSize="sm"
            title={dateFullFmt.format(new Date(event.blockTimestamp * 1000))}
            whiteSpace="nowrap"
          >
            {fmtWhen(event.blockTimestamp)}
          </Text>
        </GridItem>
        <GridItem minW={0}>
          <MobileLabel>Event</MobileLabel>
          <HStack spacing="xs">
            <Box bg={style.color} borderRadius="full" flexShrink={0} h="8px" w="8px" />
            <Text fontSize="sm" fontWeight="500" noOfLines={1}>
              {style.legendLabel}
            </Text>
          </HStack>
          <Text
            color="font.secondary"
            display={{ base: 'block', md: 'none' }}
            fontFamily="mono"
            fontSize="xs"
            noOfLines={1}
          >
            {event.eventName}
          </Text>
        </GridItem>
        <GridItem minW={0}>
          <MobileLabel>Arguments</MobileLabel>
          <ArgList args={event.args} />
        </GridItem>
        <GridItem
          fontFamily="mono"
          fontSize="sm"
          justifySelf={{ base: 'start', md: 'end' }}
        >
          <MobileLabel>Tx</MobileLabel>
          <Link
            href={getBlockExplorerTxUrl(event.txHash, chain)}
            rel="noreferrer"
            target="_blank"
          >
            {shortHash(event.txHash)}
          </Link>
        </GridItem>
      </Grid>
    </Box>
  )
}

export function PoolEventLog({
  events,
  chain,
  loading = false,
}: {
  events: PoolParamEvent[]
  chain: GqlChain
  /** True while the parent's `usePoolEvents` hook is still resolving. We
   *  forward it to the PaginatedTable so first-paint shows skeleton rows
   *  instead of the "no events" empty state, which would be misleading
   *  during the streaming window. */
  loading?: boolean
}): React.JSX.Element {
  // Newest-first canonical order; filtering and pagination derive from this.
  const sorted = useMemo(() => [...events].sort((a, b) => b.blockTimestamp - a.blockTimestamp), [
    events,
  ])

  // Filter chips only render for categories actually present so the strip
  // stays small and meaningful.
  const presentCategories = useMemo(() => {
    const set = new Set<EventCategory>()
    for (const e of sorted) set.add(getEventStyle(e.eventName).category)
    return CATEGORY_ORDER.filter(c => set.has(c))
  }, [sorted])

  const countByCategory = useMemo(() => {
    const m = new Map<EventCategory, number>()
    for (const e of sorted) {
      const cat = getEventStyle(e.eventName).category
      m.set(cat, (m.get(cat) ?? 0) + 1)
    }
    return m
  }, [sorted])

  // Track *disabled* categories. Default empty = everything on. Click a
  // chip / menu item flips that one category's state — symmetric, matches
  // the user mental model ("each filter is independently ON or OFF").
  const [disabled, setDisabled] = useState<Set<EventCategory>>(new Set())
  const [pageIndex, setPageIndex] = useState(0)
  // 20 keeps the visible table around the same vertical footprint as the
  // chart card above it on common viewports — most pools fit on one or two
  // pages without forcing the user past the fold.
  const [pageSize, setPageSize] = useState(20)

  const toggleCategory = useCallback((cat: EventCategory) => {
    setDisabled(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
    setPageIndex(0)
  }, [])

  const resetCategories = useCallback(() => {
    setDisabled(new Set())
    setPageIndex(0)
  }, [])

  const filtered = useMemo(() => {
    if (disabled.size === 0) return sorted
    return sorted.filter(e => !disabled.has(getEventStyle(e.eventName).category))
  }, [sorted, disabled])

  const pageItems = useMemo(() => {
    const start = pageIndex * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, pageIndex, pageSize])

  const paginationProps = getPaginationProps(
    filtered.length,
    { pageIndex, pageSize },
    state => {
      setPageIndex(state.pageIndex)
      setPageSize(state.pageSize)
    }
  )

  return (
    <Card overflow="hidden" p={{ base: 'sm', md: 'md' }} variant="level1">
      <VStack align="stretch" spacing="md">
        <Flex
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap="md"
          justify="space-between"
        >
          <VStack align="flex-start" spacing="xs">
            <Heading size="h5">Parameter events</Heading>
            <Text color="font.secondary" fontSize="xs">
              {loading && sorted.length === 0
                ? 'Indexing parameter events…'
                : filtered.length === sorted.length
                  ? `${sorted.length.toLocaleString()} event${sorted.length === 1 ? '' : 's'}`
                  : `${filtered.length.toLocaleString()} of ${sorted.length.toLocaleString()} events`}
            </Text>
          </VStack>
        </Flex>

        {presentCategories.length > 1 &&
          (presentCategories.length <= INLINE_CHIP_THRESHOLD ? (
            <HStack flexWrap="wrap" spacing="xs">
              {presentCategories.map(cat => (
                <CategoryChip
                  cat={cat}
                  count={countByCategory.get(cat) ?? 0}
                  enabled={!disabled.has(cat)}
                  key={cat}
                  onToggle={toggleCategory}
                />
              ))}
              {disabled.size > 0 && (
                <Button onClick={resetCategories} size="sm" variant="ghost">
                  Reset
                </Button>
              )}
            </HStack>
          ) : (
            <CategoryFilterMenu
              countByCategory={countByCategory}
              disabled={disabled}
              onReset={resetCategories}
              onToggle={toggleCategory}
              present={presentCategories}
            />
          ))}

        <Card overflow="hidden" p={0} variant="subSection">
          <Box w="full">
            <PaginatedTable<PoolParamEvent>
              getRowId={ev => `${ev.txHash}-${ev.logIndex}`}
              items={pageItems}
              loading={loading && sorted.length === 0}
              loadingLength={pageSize}
              loadingSpinnerPosition="top"
              noItemsFoundLabel={
                sorted.length === 0
                  ? "No parameter events recorded in the scanned window — either the pool's parameters have never changed, or the scan hasn't reached its deployment block yet."
                  : 'No events match the current filter.'
              }
              paginationProps={paginationProps}
              renderTableHeader={() => <EventHeader />}
              renderTableRow={({ item, index }) => (
                <EventRow chain={chain} event={item} index={index} />
              )}
              showPagination={filtered.length > pageSize}
            />
          </Box>
        </Card>
      </VStack>
    </Card>
  )
}
