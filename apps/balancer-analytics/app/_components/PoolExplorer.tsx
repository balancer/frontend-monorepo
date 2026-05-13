'use client'

import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import { useCallback, useMemo } from 'react'
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  parseAsStringLiteral,
  useQueryState,
} from 'nuqs'
import {
  GqlChain,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { chainToSlugMap } from '@repo/lib/modules/pool/pool.utils'
import { PaginatedTable } from '@repo/lib/shared/components/tables/PaginatedTable'
import { getPaginationProps } from '@repo/lib/shared/components/pagination/getPaginationProps'
import { SortableHeader, Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import {
  EnrichedPool,
  SortKey,
  SortDir,
  usePoolExplorer,
} from '@analytics/lib/hooks/usePoolExplorer'
import { PoolTokenPillsLite } from './PoolTokenPillsLite'
import { PoolDetailsCellLite } from './PoolDetailsCellLite'
import { PoolExplorerFilters } from './PoolExplorerFilters'

const SORT_KEYS = ['TVL', 'VOLUME', 'FEES', 'APR', 'YIELD_DAY', 'USAGE', 'HOLDERS'] as const

// chain icon · pool · details · TVL · vol · fees · APR · usage · holders
// On `base`-`md` the table is horizontal-scrollable. On `lg` we hide
// `usage` + `holders` so the eight remaining columns fit in a 1280px
// viewport. On `2xl+` (≥1536) all columns appear without scroll.
const GRID_COLS_BASE =
  '36px minmax(260px, 1.4fr) minmax(190px, 0.9fr) 110px 110px 110px 90px 90px 80px'
const GRID_COLS_LG =
  '32px minmax(220px, 1.5fr) minmax(160px, 0.8fr) 100px 100px 100px 80px'
const GRID_COLS_2XL =
  '36px minmax(260px, 1.6fr) minmax(190px, 0.9fr) 110px 110px 110px 90px 90px 80px'

const usd = (n: number, abbrev = true) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: abbrev ? 'compact' : 'standard',
    maximumFractionDigits: 2,
  }).format(n || 0)

const num = (n: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0)

const pct = (n: number, digits = 2) => `${(n * 100).toFixed(digits)}%`

function getPoolHref(p: EnrichedPool): string {
  const slug = chainToSlugMap[p.chain] ?? 'ethereum'
  const variant = p.protocolVersion === 3 ? 'v3' : 'v2'
  return `https://balancer.fi/pools/${slug}/${variant}/${p.id}`
}

function buildCsv(rows: EnrichedPool[]): string {
  const headers = [
    'name',
    'symbol',
    'chain',
    'type',
    'protocolVersion',
    'hook',
    'address',
    'id',
    'tvl',
    'volume24h',
    'fees24h',
    'totalApr',
    'yieldApr',
    'yieldPerDay',
    'usage24h',
    'holders',
    'swapFee',
  ]
  const escape = (val: unknown) => {
    const s = String(val ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = rows.map(p =>
    [
      p.name,
      p.symbol,
      p.chain,
      p.type,
      p.protocolVersion,
      p._hookType ?? '',
      p.address,
      p.id,
      Number(p.dynamicData.totalLiquidity ?? 0),
      Number(p.dynamicData.volume24h ?? 0),
      Number(p.dynamicData.fees24h ?? 0),
      p._totalApr,
      p._yieldApr,
      p._yieldPerDay,
      p._usage,
      p._holders,
      Number(p.dynamicData.swapFee ?? 0),
    ]
      .map(escape)
      .join(',')
  )
  return [headers.join(','), ...lines].join('\n')
}

function downloadCsv(rows: EnrichedPool[]) {
  const csv = buildCsv(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `balancer-pools-${new Date().toISOString().slice(0, 19)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function PoolExplorer() {
  // URL state — shareable view. SearchInput debounces internally, so we point
  // it directly at the nuqs param rather than maintaining a separate draft.
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''))
  const [chains, setChains] = useQueryState(
    'chain',
    parseAsArrayOf(parseAsStringEnum<GqlChain>(Object.values(GqlChain))).withDefault([])
  )
  const [types, setTypes] = useQueryState(
    'type',
    parseAsArrayOf(parseAsStringEnum<GqlPoolType>(Object.values(GqlPoolType))).withDefault([])
  )
  const [protocolVersion, setProtocolVersion] = useQueryState(
    'v',
    parseAsInteger
  )
  const [hookTypes, setHookTypes] = useQueryState(
    'hook',
    parseAsArrayOf(parseAsString).withDefault([])
  )
  const [minTvl, setMinTvl] = useQueryState('minTvl', parseAsInteger.withDefault(0))
  const [sortKey, setSortKey] = useQueryState(
    'sort',
    parseAsStringLiteral(SORT_KEYS).withDefault('TVL')
  )
  const [sortDir, setSortDir] = useQueryState(
    'dir',
    parseAsStringLiteral(['asc', 'desc'] as const).withDefault('desc')
  )
  const [pageIndex, setPageIndex] = useQueryState('page', parseAsInteger.withDefault(0))
  const [pageSize, setPageSize] = useQueryState('size', parseAsInteger.withDefault(25))

  const filters = useMemo(
    () => ({
      search,
      chains,
      types,
      protocolVersion,
      hookTypes,
      minTvl,
    }),
    [search, chains, types, protocolVersion, hookTypes, minTvl]
  )

  const {
    loading,
    error,
    totalCount,
    filteredCount,
    pageItems,
    allFilteredSorted,
    availableChains,
    availableTypes,
    availableHooks,
  } = usePoolExplorer({
    filters,
    sortKey,
    sortDir,
    pageIndex,
    pageSize,
  })

  // Reset page whenever filters change so we never land on an empty page.
  const resetPage = useCallback(() => setPageIndex(0), [setPageIndex])

  const filterSetters = useMemo(
    () => ({
      setSearch: (v: string) => {
        setSearch(v || null)
        resetPage()
      },
      setChains: (v: GqlChain[]) => {
        setChains(v.length ? v : null)
        resetPage()
      },
      setTypes: (v: GqlPoolType[]) => {
        setTypes(v.length ? v : null)
        resetPage()
      },
      setProtocolVersion: (v: number | null) => {
        setProtocolVersion(v)
        resetPage()
      },
      setHookTypes: (v: string[]) => {
        setHookTypes(v.length ? v : null)
        resetPage()
      },
      setMinTvl: (v: number) => {
        setMinTvl(v > 0 ? v : null)
        resetPage()
      },
      resetAll: () => {
        setSearch(null)
        setChains(null)
        setTypes(null)
        setProtocolVersion(null)
        setHookTypes(null)
        setMinTvl(null)
        resetPage()
      },
    }),
    [setSearch, setChains, setTypes, setProtocolVersion, setHookTypes, setMinTvl, resetPage]
  )

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir(sortDir === 'desc' ? 'asc' : 'desc')
      } else {
        setSortKey(key)
        setSortDir('desc')
      }
      resetPage()
    },
    [sortKey, sortDir, setSortDir, setSortKey, resetPage]
  )

  const paginationProps = getPaginationProps(
    filteredCount,
    { pageIndex, pageSize },
    state => {
      setPageIndex(state.pageIndex)
      setPageSize(state.pageSize)
    }
  )

  return (
    <Card overflow="hidden" p={{ base: 'sm', md: 'md' }} variant="level1">
      <VStack align="stretch" spacing="md">
        <Flex align="flex-start" gap="md" justify="space-between">
          <VStack align="flex-start" spacing="xs">
            <Heading size="h5">Pool monitor</Heading>
            <Text color="font.secondary" fontSize="xs">
              {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} pools matching
              filters
            </Text>
          </VStack>
          <Stack align="stretch" direction="column" minW="120px" spacing="xs">
            <Button
              isDisabled={!allFilteredSorted.length}
              leftIcon={<DownloadIcon />}
              onClick={() => downloadCsv(allFilteredSorted)}
              size="sm"
              variant="tertiary"
            >
              CSV
            </Button>
            <PoolExplorerFilters
              availableChains={availableChains}
              availableHooks={availableHooks}
              availableTypes={availableTypes}
              filters={filters}
              isSearching={loading}
              setters={filterSetters}
              variant="trigger-only"
            />
          </Stack>
        </Flex>

        <PoolExplorerFilters
          availableChains={availableChains}
          availableHooks={availableHooks}
          availableTypes={availableTypes}
          filters={filters}
          isSearching={loading}
          setters={filterSetters}
          variant="search-and-chips"
        />

        {error && (
          <Text color="red.300" fontSize="sm">
            Failed to load: {error.message}
          </Text>
        )}

        <Card
          overflowX={{ base: 'auto', lg: 'hidden' }}
          overflowY="hidden"
          p={0}
          variant="subSection"
        >
          <Box minW={{ base: '1100px', lg: 'auto' }} w="full">
            <PaginatedTable<EnrichedPool>
              getRowId={p => `${p.chain}-${p.id}`}
              items={pageItems}
              loading={loading}
              loadingLength={pageSize}
              loadingSpinnerPosition="top"
              noItemsFoundLabel="No pools match these filters"
              paginationProps={paginationProps}
              renderTableHeader={() => (
                <TableHeader handleSort={handleSort} sortDir={sortDir} sortKey={sortKey} />
              )}
              renderTableRow={({ item, index }) => <TableRow index={index} pool={item} />}
              showPagination={filteredCount > pageSize}
            />
          </Box>
        </Card>
      </VStack>
    </Card>
  )
}

// Hidden at the `lg` breakpoint: details column gets folded into the pool
// name (PoolDetailsCellLite is rendered below the token pills on lg), and
// the usage/holders columns are hidden so the table fits a 1280px viewport.
// At `2xl` everything reappears as standalone columns.
const RESPONSIVE_COLS = {
  base: GRID_COLS_BASE,
  lg: GRID_COLS_LG,
  '2xl': GRID_COLS_2XL,
}

function TableHeader({
  sortKey,
  sortDir,
  handleSort,
}: {
  sortKey: SortKey
  sortDir: SortDir
  handleSort: (k: SortKey) => void
}) {
  const sorted = (k: SortKey) => sortKey === k
  const sorting = sortDir === 'desc' ? Sorting.desc : Sorting.asc

  return (
    <Grid
      alignItems="center"
      borderBottom="1px solid"
      borderColor="border.base"
      gap={{ base: 'sm', lg: 'ms' }}
      gridTemplateColumns={RESPONSIVE_COLS}
      px={{ base: 'md', lg: 'ms' }}
      py="sm"
      w="full"
    >
      <GridItem />
      <GridItem>
        <Text color="font.secondary" fontSize="xs" fontWeight="bold">
          Pool
        </Text>
      </GridItem>
      <GridItem display={{ base: 'block', lg: 'none', '2xl': 'block' }}>
        <Text color="font.secondary" fontSize="xs" fontWeight="bold">
          Details
        </Text>
      </GridItem>
      <GridItem justifySelf="end">
        <SortableHeader
          align="right"
          isSorted={sorted('TVL')}
          label="TVL"
          onSort={() => handleSort('TVL')}
          sorting={sorting}
        />
      </GridItem>
      <GridItem justifySelf="end">
        <SortableHeader
          align="right"
          isSorted={sorted('VOLUME')}
          label="Vol 24h"
          onSort={() => handleSort('VOLUME')}
          sorting={sorting}
        />
      </GridItem>
      <GridItem justifySelf="end">
        <SortableHeader
          align="right"
          isSorted={sorted('FEES')}
          label="Fees 24h"
          onSort={() => handleSort('FEES')}
          sorting={sorting}
        />
      </GridItem>
      <GridItem justifySelf="end">
        <SortableHeader
          align="right"
          isSorted={sorted('APR')}
          label="APR"
          onSort={() => handleSort('APR')}
          sorting={sorting}
        />
      </GridItem>
      <GridItem
        display={{ base: 'block', lg: 'none', '2xl': 'block' }}
        justifySelf="end"
      >
        <SortableHeader
          align="right"
          isSorted={sorted('USAGE')}
          label="Utilization"
          onSort={() => handleSort('USAGE')}
          sorting={sorting}
        />
      </GridItem>
      <GridItem
        display={{ base: 'block', lg: 'none', '2xl': 'block' }}
        justifySelf="end"
      >
        <SortableHeader
          align="right"
          isSorted={sorted('HOLDERS')}
          label="Holders"
          onSort={() => handleSort('HOLDERS')}
          sorting={sorting}
        />
      </GridItem>
    </Grid>
  )
}

function TableRow({ pool, index }: { pool: EnrichedPool; index: number }) {
  const tvl = Number(pool.dynamicData.totalLiquidity ?? 0)
  const vol = Number(pool.dynamicData.volume24h ?? 0)
  const fees = Number(pool.dynamicData.fees24h ?? 0)
  const usageColor =
    pool._usage >= 0.5 ? 'green.400' : pool._usage >= 0.1 ? 'orange.300' : 'font.secondary'

  return (
    <Box
      _hover={{ bg: 'background.level0' }}
      borderBottom={index === 0 ? undefined : '1px solid'}
      borderColor="border.base"
      transition="background 0.15s"
      w="full"
    >
      <Link href={getPoolHref(pool)} prefetch={false} role="group" target="_blank">
        <Grid
          alignItems="center"
          gap={{ base: 'sm', lg: 'ms' }}
          gridTemplateColumns={RESPONSIVE_COLS}
          px={{ base: 'md', lg: 'ms' }}
          py="ms"
          w="full"
        >
          <GridItem>
            <NetworkIcon chain={pool.chain} size={6} />
          </GridItem>

          <GridItem minW={0}>
            <Box display={{ base: 'block', lg: 'flex', '2xl': 'block' }} flexDirection="column" gap="xxs">
              <PoolTokenPillsLite pool={pool} />
              {/* On lg only, fold the details under the pool tokens. */}
              <Box display={{ base: 'none', lg: 'block', '2xl': 'none' }}>
                <PoolDetailsCellLite pool={pool} />
              </Box>
            </Box>
          </GridItem>

          <GridItem display={{ base: 'block', lg: 'none', '2xl': 'block' }} minW={0}>
            <PoolDetailsCellLite pool={pool} />
          </GridItem>

          <GridItem justifySelf="end">
            <Text fontWeight="medium" textAlign="right" title={usd(tvl, false)}>
              {usd(tvl)}
            </Text>
          </GridItem>
          <GridItem justifySelf="end">
            <Text fontWeight="medium" textAlign="right" title={usd(vol, false)}>
              {usd(vol)}
            </Text>
          </GridItem>
          <GridItem justifySelf="end">
            <Text fontWeight="medium" textAlign="right" title={usd(fees, false)}>
              {usd(fees)}
            </Text>
          </GridItem>
          <GridItem justifySelf="end">
            <Text fontWeight="medium" textAlign="right">
              {pct(pool._totalApr)}
            </Text>
          </GridItem>
          <GridItem
            display={{ base: 'block', lg: 'none', '2xl': 'block' }}
            justifySelf="end"
          >
            <Text color={usageColor} fontWeight="medium" textAlign="right">
              {pct(pool._usage, 1)}
            </Text>
          </GridItem>
          <GridItem
            display={{ base: 'block', lg: 'none', '2xl': 'block' }}
            justifySelf="end"
          >
            <Text color="font.secondary" fontSize="sm" textAlign="right">
              {num(pool._holders)}
            </Text>
          </GridItem>
        </Grid>
      </Link>
    </Box>
  )
}
