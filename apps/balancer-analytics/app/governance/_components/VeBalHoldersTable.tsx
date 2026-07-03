'use client'

import { useMemo, useState } from 'react'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import {
  Badge,
  Box,
  Card,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Link as ChakraLink,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { AlertTriangle, ExternalLink } from 'react-feather'
import { PaginatedTable } from '@repo/lib/shared/components/tables/PaginatedTable'
import { getPaginationProps } from '@repo/lib/shared/components/pagination/getPaginationProps'
import { useVeBalHolders } from '@analytics/lib/hooks/useVeBalHolders'
import type { VeBalHolderRow } from '@analytics/lib/dune/fetch-vebal-holders'
import { getBlockExplorerAddressUrl } from '@analytics/lib/networks/chain-info'

const compactFmt = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
})
const intFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

const DECOM_BIP_URL = 'https://forum.balancer.fi/search?q=BIP-921'

// Default page size mirrors the pool monitor convention (20 rows). Each
// row is ~36 px so a full page fits ~720 px tall — comfortable on a
// laptop without pushing recent proposals below the fold.
const DEFAULT_PAGE_SIZE = 20

// Five-column grid: day · wallet · provider · veBAL balance · share.
// Wider wallet/balance columns on lg so the mono digits don't wrap;
// providers flex to fill the middle. `minmax(0, …)` so long provider
// names truncate via `noOfLines` rather than blowing out the layout.
const GRID_COLS_BASE = '110px 140px minmax(0, 1fr) 110px 80px'
const GRID_COLS_LG = '130px 160px minmax(0, 1fr) 130px 90px'
const RESPONSIVE_COLS = { base: GRID_COLS_BASE, lg: GRID_COLS_LG }

/**
 * veBAL holder table — paginated tabular layout sourced from Dune query
 * 601405. Columns mirror the Dune schema exactly so the rendered table
 * doubles as documentation of what the data source returns:
 *
 *   | day | wallet_address | provider | vebal_balance | pct |
 *
 * Pagination matches the pool monitor's `PaginatedTable` + `getPaginationProps`
 * pattern so the look-and-feel is consistent across the app.
 */
export function VeBalHoldersTable() {
  const { data, loading, error } = useVeBalHolders()

  const rows = useMemo(() => data?.rows ?? [], [data])
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const totalCount = rows.length

  const pageItems = useMemo(() => {
    const start = pageIndex * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, pageIndex, pageSize])

  const paginationProps = getPaginationProps(
    totalCount,
    { pageIndex, pageSize },
    state => {
      setPageIndex(state.pageIndex)
      setPageSize(state.pageSize)
    }
  )

  const day = data?.day ?? ''

  return (
    <Card display="flex" flexDirection="column" h="full" variant="level1">
      <Flex align="center" justify="space-between" mb="md">
        <HStack spacing="sm">
          <Heading size="h5">veBAL holders</Heading>
          <Badge colorScheme="orange" fontSize="xs" variant="subtle">
            decommissioned
          </Badge>
        </HStack>
        <Text color="font.secondary" fontSize="sm">
          {totalCount > 0
            ? `${totalCount} holders · Dune 601405 · refreshed weekly`
            : 'Dune 601405 · refreshed weekly'}
        </Text>
      </Flex>

      <DecommissionedBanner />

      {error ? (
        <Text color="red.300" fontSize="sm" mt="md">
          Failed to load holders: {error.message}
        </Text>
      ) : (
        <Card
          mt="md"
          overflowX={{ base: 'auto', lg: 'hidden' }}
          overflowY="hidden"
          p={0}
          variant="subSection"
        >
          <Box minW={{ base: '720px', lg: 'auto' }} w="full">
            <PaginatedTable<VeBalHolderRow>
              getRowId={r => `${r.provider}-${r.walletAddress}`}
              items={pageItems}
              loading={loading}
              loadingLength={pageSize}
              loadingSpinnerPosition="top"
              noItemsFoundLabel="No holder snapshot available"
              paginationProps={paginationProps}
              renderTableHeader={() => <TableHeader />}
              renderTableRow={({ item }) => <TableRow day={day} row={item} />}
              showPagination={totalCount > pageSize}
            />
          </Box>
        </Card>
      )}
    </Card>
  )
}

function TableHeader() {
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
      <GridItem>
        <Text color="font.secondary" fontSize="xs" fontWeight="bold">
          Day
        </Text>
      </GridItem>
      <GridItem>
        <Text color="font.secondary" fontSize="xs" fontWeight="bold">
          Wallet address
        </Text>
      </GridItem>
      <GridItem>
        <Text color="font.secondary" fontSize="xs" fontWeight="bold">
          Provider
        </Text>
      </GridItem>
      <GridItem justifySelf="end">
        <Text color="font.secondary" fontSize="xs" fontWeight="bold">
          veBAL balance
        </Text>
      </GridItem>
      <GridItem justifySelf="end">
        <Text color="font.secondary" fontSize="xs" fontWeight="bold">
          Share
        </Text>
      </GridItem>
    </Grid>
  )
}

function TableRow({ row, day }: { row: VeBalHolderRow; day: string }) {
  const explorerHref = row.walletAddress
    ? getBlockExplorerAddressUrl(row.walletAddress, GqlChainValues.Mainnet)
    : null
  return (
    <Box
      _hover={{ bg: 'background.level0' }}
      borderBottom="1px dashed"
      borderColor="border.subduedZen"
      transition="background 0.15s"
      w="full"
    >
      <Grid
        alignItems="center"
        gap={{ base: 'sm', lg: 'ms' }}
        gridTemplateColumns={RESPONSIVE_COLS}
        px={{ base: 'md', lg: 'ms' }}
        py="sm"
        w="full"
      >
        <GridItem color="font.secondary" fontFamily="mono" fontSize="sm">
          {formatDay(day)}
        </GridItem>
        <GridItem minW={0}>
          {explorerHref ? (
            <ChakraLink
              _hover={{ color: 'font.linkHover' }}
              color="font.link"
              fontFamily="mono"
              fontSize="sm"
              href={explorerHref}
              isExternal
            >
              <HStack spacing="2xs">
                <Text as="span">{shortenAddr(row.walletAddress)}</Text>
                <ExternalLink size={12} />
              </HStack>
            </ChakraLink>
          ) : (
            <Text fontFamily="mono" fontSize="sm">
              —
            </Text>
          )}
        </GridItem>
        <GridItem minW={0}>
          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
            {row.provider}
          </Text>
        </GridItem>
        <GridItem fontFamily="mono" fontSize="sm" justifySelf="end">
          <Tooltip
            hasArrow
            label={`${intFmt.format(row.veBalBalance)} veBAL`}
            openDelay={250}
          >
            <Text as="span" cursor="help" fontWeight="medium">
              {compactFmt.format(row.veBalBalance)}
            </Text>
          </Tooltip>
        </GridItem>
        <GridItem
          color="font.secondary"
          fontFamily="mono"
          fontSize="sm"
          justifySelf="end"
        >
          {(row.pct * 100).toFixed(2)}%
        </GridItem>
      </Grid>
    </Box>
  )
}

function DecommissionedBanner() {
  return (
    <Box
      bg="background.level0"
      border="1px solid"
      borderColor="orange.300"
      borderRadius="md"
      px="md"
      py="sm"
    >
      <HStack align="flex-start" spacing="sm">
        <Box color="orange.300" mt="2px">
          <AlertTriangle size={16} />
        </Box>
        <VStack align="stretch" spacing="2xs">
          <Text color="font.maxContrast" fontSize="sm" fontWeight="medium">
            Decommissioned by BIP-921
          </Text>
          <Text color="font.secondary" fontSize="xs" lineHeight="short">
            New veBAL locks are disabled. Existing locks remain queryable; the rows
            below are preserved for historical reference.{' '}
            <ChakraLink color="font.link" href={DECOM_BIP_URL} isExternal>
              Read BIP-921 <ExternalLink size={11} style={{ display: 'inline' }} />
            </ChakraLink>
          </Text>
        </VStack>
      </HStack>
    </Box>
  )
}

// Dune returns `YYYY-MM-DD HH:MM:SS`; the time portion is always midnight
// (snapshot timestamp), so we just surface the date.
function formatDay(day: string): string {
  return day.slice(0, 10) || day || '—'
}

function shortenAddr(addr: string): string {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}