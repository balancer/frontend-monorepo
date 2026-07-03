'use client'

import {
  Box,
  Card,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import { ChevronRight } from 'react-feather'
import { useMemo, useState } from 'react'
import {
  parseAsStringEnum,
  parseAsStringLiteral,
  useQueryState,
} from 'nuqs'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { chainToSlugMap } from '@repo/lib/modules/pool/pool.utils'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { SortableHeader, Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'
import { PoolTokenPillsLite } from '../../_components/PoolTokenPillsLite'
import { PoolDetailsCellLite } from '../../_components/PoolDetailsCellLite'
import type { PortfolioPosition } from '@analytics/lib/hooks/usePortfolioByAddress'
// The P&L route + usePortfolioPnl hook are intentionally retained in the
// codebase: the cost-basis + IL math works but needs more polish (rate-
// providing tokens, FIFO lot tracking) before we re-expose it. To bring
// the column back, restore the import below plus the corresponding header
// / cell / sort branch.
// import { usePortfolioPnl, type PnlResult } from '@analytics/lib/hooks/usePortfolioPnl'

const usd = (n: number, abbrev = true) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: abbrev ? 'compact' : 'standard',
    maximumFractionDigits: 2,
  }).format(n || 0)

const pct = (n: number, digits = 2) => `${(n * 100).toFixed(digits)}%`

// Pool share format: always 2 decimals, but tiny shares (< 0.01%) get a
// readable floor instead of rounding to "0.00%" which reads as a bug.
const poolSharePct = (n: number): string => {
  const v = (n ?? 0) * 100
  if (!Number.isFinite(v) || v <= 0) return '0%'
  if (v < 0.01) return '< 0.01%'
  return `${v.toFixed(2)}%`
}

// Mirror PoolExplorer's grid template so the two tables read consistently.
// chain · pool · details · position USD · APR · est daily · staking
const GRID_COLS_BASE =
  '36px minmax(260px, 1.4fr) minmax(180px, 0.9fr) 110px 100px 110px 110px'
const GRID_COLS_LG =
  '32px minmax(220px, 1.5fr) minmax(160px, 0.8fr) 100px 80px 100px 100px'

const RESPONSIVE_COLS = { base: GRID_COLS_BASE, lg: GRID_COLS_LG }

const SORT_KEYS = ['POSITION', 'APR', 'DAILY', 'STAKED'] as const
type SortKey = (typeof SORT_KEYS)[number]
type SortDir = 'asc' | 'desc'

const STAKING_LABELS: Record<string, string> = {
  AURA: 'Aura',
  GAUGE: 'Gauge',
  VEBAL: 'veBAL',
  RELIQUARY: 'Reliquary',
  MASTER_CHEF: 'MasterChef',
  FRESH_BEETS: 'Fresh BEETS',
}

function getPoolHref(p: PortfolioPosition): string {
  const slug = chainToSlugMap[p.chain] ?? 'ethereum'
  return `/pool/${slug}/${p.pool.id}`
}

export function PortfolioPositionsTable({ positions }: { positions: PortfolioPosition[] }) {
  const [chainFilter, setChainFilter] = useQueryState(
    'chain',
    parseAsStringEnum<GqlChain>(Object.values(GqlChainValues))
  )
  const [sortKey, setSortKey] = useQueryState(
    'sort',
    parseAsStringLiteral(SORT_KEYS).withDefault('POSITION')
  )
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const filtered = useMemo(
    () => (chainFilter ? positions.filter(p => p.chain === chainFilter) : positions),
    [positions, chainFilter]
  )

  const sorted = useMemo(() => {
    const arr = [...filtered]
    const dir = sortDir === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      switch (sortKey) {
        case 'APR':
          return (a.totalApr - b.totalApr) * dir
        case 'DAILY':
          return (
            (a.dailyFeesUsd + a.dailyYieldUsd + a.dailyRewardsUsd -
              (b.dailyFeesUsd + b.dailyYieldUsd + b.dailyRewardsUsd)) *
            dir
          )
        case 'STAKED':
          return (a.stakedUsd - b.stakedUsd) * dir
        case 'POSITION':
        default:
          return (a.positionUsd - b.positionUsd) * dir
      }
    })
    return arr
  }, [filtered, sortKey, sortDir])

  // Distinct chains present in the portfolio — feeds the filter chip row.
  const availableChains = useMemo(() => {
    const set = new Set<GqlChain>()
    for (const p of positions) set.add(p.chain)
    return Array.from(set)
  }, [positions])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <Card overflow="hidden" variant="level1">
      <VStack align="stretch" spacing="md">
        <Flex align="flex-start" flexWrap="wrap" gap="md" justify="space-between">
          <VStack align="flex-start" spacing="xs">
            <Heading size="h5">Positions</Heading>
            <Text color="font.secondary" fontSize="xs">
              {sorted.length} of {positions.length} positions · click a row to open pool details
            </Text>
          </VStack>
          {availableChains.length > 1 && (
            <HStack flexWrap="wrap" spacing="xs">
              <ChainChip
                isActive={chainFilter === null}
                label="All chains"
                onClick={() => setChainFilter(null)}
              />
              {availableChains.map(c => (
                <ChainChip
                  chain={c}
                  isActive={chainFilter === c}
                  key={c}
                  label={c.charAt(0) + c.slice(1).toLowerCase()}
                  onClick={() => setChainFilter(chainFilter === c ? null : c)}
                />
              ))}
            </HStack>
          )}
        </Flex>

        <Card
          overflowX={{ base: 'auto', lg: 'hidden' }}
          overflowY="hidden"
          p={0}
          variant="subSection"
        >
          <Box minW={{ base: '960px', lg: 'auto' }} w="full">
            <TableHeader handleSort={handleSort} sortDir={sortDir} sortKey={sortKey} />
            {sorted.length === 0 ? (
              <Box p="md">
                <Text color="font.secondary" fontSize="sm">
                  No positions match this filter.
                </Text>
              </Box>
            ) : (
              sorted.map((pos, i) => <TableRow index={i} key={pos.pool.id} position={pos} />)
            )}
          </Box>
        </Card>
      </VStack>
    </Card>
  )
}

function ChainChip({
  chain,
  label,
  isActive,
  onClick,
}: {
  chain?: GqlChain
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Box
      _hover={
        isActive ? undefined : { color: 'font.maxContrast', bg: 'background.level2' }
      }
      as="button"
      bg={isActive ? 'background.level3' : 'background.level0'}
      border="1px solid"
      borderColor={isActive ? 'border.highlight' : 'border.subduedZen'}
      borderRadius="full"
      color={isActive ? 'font.maxContrast' : 'font.secondary'}
      cursor="pointer"
      fontSize="xs"
      fontWeight="medium"
      onClick={onClick}
      px="ms"
      py="xs"
      transition="all 0.15s"
      type="button"
    >
      <HStack spacing="xs">
        {chain && <NetworkIcon chain={chain} size={3} />}
        <span>{label}</span>
      </HStack>
    </Box>
  )
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
      <GridItem>
        <Text color="font.secondary" fontSize="xs" fontWeight="bold">
          Details
        </Text>
      </GridItem>
      <GridItem justifySelf="end">
        <SortableHeader
          align="right"
          isSorted={sorted('POSITION')}
          label="Position"
          onSort={() => handleSort('POSITION')}
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
      <GridItem justifySelf="end">
        <SortableHeader
          align="right"
          isSorted={sorted('DAILY')}
          label="Est daily"
          onSort={() => handleSort('DAILY')}
          sorting={sorting}
        />
      </GridItem>
      <GridItem justifySelf="end">
        <SortableHeader
          align="right"
          isSorted={sorted('STAKED')}
          label="Staked"
          onSort={() => handleSort('STAKED')}
          sorting={sorting}
        />
      </GridItem>
    </Grid>
  )
}

function TableRow({ position, index }: { position: PortfolioPosition; index: number }) {
  const dailyTotal = position.dailyFeesUsd + position.dailyYieldUsd + position.dailyRewardsUsd
  const stakingLabel = position.stakingType ? STAKING_LABELS[position.stakingType] ?? position.stakingType : null
  const stakedPct = position.positionUsd > 0 ? position.stakedUsd / position.positionUsd : 0

  const dailyTooltip = `Fees ${usd(position.dailyFeesUsd)}/d · Yield ${usd(position.dailyYieldUsd)}/d · Rewards ${usd(position.dailyRewardsUsd)}/d`

  return (
    <Box
      _hover={{
        bg: 'background.level0',
        boxShadow: 'inset 2px 0 0 0 var(--chakra-colors-font-highlight)',
      }}
      borderBottom={index === 0 ? undefined : '1px solid'}
      borderColor="border.base"
      sx={{
        '&:hover .portfolio-row-chevron': {
          opacity: 1,
          transform: 'translateX(2px)',
        },
      }}
      transition="background 0.15s, box-shadow 0.15s"
      w="full"
    >
      <Link
        aria-label={`View pool details for ${position.pool.poolTokens?.map(t => t.symbol).filter(Boolean).join(' / ') || position.pool.id}`}
        href={getPoolHref(position)}
        prefetch={false}
        role="group"
        style={{ cursor: 'pointer', display: 'block' }}
      >
        <Grid
          alignItems="center"
          gap={{ base: 'sm', lg: 'ms' }}
          gridTemplateColumns={RESPONSIVE_COLS}
          px={{ base: 'md', lg: 'ms' }}
          py="ms"
          w="full"
        >
          <GridItem>
            <NetworkIcon chain={position.chain} size={6} />
          </GridItem>

          <GridItem minW={0}>
            <PoolTokenPillsLite tokens={position.pool.poolTokens ?? []} type={position.pool.type} />
          </GridItem>

          <GridItem minW={0}>
            <PoolDetailsCellLite pool={position.pool} />
          </GridItem>

          <GridItem justifySelf="end">
            <VStack align="flex-end" spacing={0}>
              <Text fontWeight="medium" textAlign="right" title={usd(position.positionUsd, false)}>
                {usd(position.positionUsd)}
              </Text>
              <Text color="font.tertiary" fontSize="2xs">
                {poolSharePct(position.shareOfPool)} of pool
              </Text>
            </VStack>
          </GridItem>

          <GridItem justifySelf="end">
            <VStack align="flex-end" spacing={0}>
              <Text fontWeight="medium" textAlign="right">
                {pct(position.totalApr)}
              </Text>
              {position.rewardApr > 0 && (
                <Text color="font.tertiary" fontSize="2xs">
                  +{pct(position.rewardApr)} reward
                </Text>
              )}
            </VStack>
          </GridItem>

          <GridItem justifySelf="end">
            <TooltipWithTouch label={dailyTooltip} placement="top">
              <Text fontWeight="medium" textAlign="right">
                {usd(dailyTotal)}
              </Text>
            </TooltipWithTouch>
          </GridItem>

          <GridItem justifySelf="end">
            <Flex align="center" gap="xs">
              <VStack align="flex-end" spacing={0}>
                {position.stakedUsd > 0 ? (
                  <>
                    <Text fontWeight="medium" textAlign="right">
                      {usd(position.stakedUsd)}
                    </Text>
                    <Text color="font.tertiary" fontSize="2xs">
                      {stakingLabel ?? 'Staked'} · {pct(stakedPct, 0)}
                    </Text>
                  </>
                ) : (
                  <Text color="font.tertiary" fontSize="xs" textAlign="right">
                    Wallet only
                  </Text>
                )}
              </VStack>
              <Icon
                aria-hidden
                as={ChevronRight}
                boxSize={4}
                className="portfolio-row-chevron"
                color="font.secondary"
                opacity={{ base: 0.4, md: 0.25 }}
                transition="opacity 0.15s, transform 0.15s"
              />
            </Flex>
          </GridItem>
        </Grid>
      </Link>
    </Box>
  )
}
