'use client'

/**
 * Searchable pool picker used by the "Compare" flow on the pool-detail page.
 *
 * Backs onto `usePoolExplorer` (the same hook the landing-page explorer uses)
 * so it shares the 500-row Apollo cache — opening this modal after browsing
 * the explorer issues zero extra network. Filtering is in-memory: search
 * matches name/symbol/address/token-symbols (`matchesSearch` inside the
 * hook), the row list paginates client-side via `pageSize`.
 *
 * The current pool is filtered out so users can't compare a pool with
 * itself — that path leads to a fully-zero comparison modal which is
 * confusing, not informative.
 */

import { GqlPoolTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import {
  Badge,
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { SearchInput } from '@repo/lib/shared/components/inputs/SearchInput'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { getPoolTypeLabel } from '@repo/lib/modules/pool/pool.utils'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { EnrichedPool, usePoolExplorer } from '@analytics/lib/hooks/usePoolExplorer'
import { PoolTokenPillsLite } from '@analytics/app/_components/PoolTokenPillsLite'

// AutoRange rebrand — matches the rest of the analytics surface.
function formatPoolTypeLabel(t: string): string {
  if (t === GqlPoolTypeValues.Reclamm) return 'AutoRange'
  return getPoolTypeLabel(t as GqlPoolType)
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n || 0)

const PAGE_SIZE = 50

const VERSION_TABS: ButtonGroupOption[] = [
  { value: 'all', label: 'All' },
  { value: 'v2', label: 'v2' },
  { value: 'v3', label: 'v3' },
  { value: 'cow', label: 'CoW' },
]

const CHAIN_TABS: ButtonGroupOption[] = [
  { value: 'same', label: 'Same chain' },
  { value: 'all', label: 'All chains' },
]

function tabToVersion(tab: string): number | null {
  if (tab === 'v3') return 3
  if (tab === 'v2') return 2
  if (tab === 'cow') return 1
  return null
}

function versionToTab(v: number | null): ButtonGroupOption {
  if (v === 3) return VERSION_TABS[2]
  if (v === 2) return VERSION_TABS[1]
  if (v === 1) return VERSION_TABS[3]
  return VERSION_TABS[0]
}

type Props = {
  isOpen: boolean
  onClose: () => void
  currentPool: { id: string; chain: GqlChain; name: string }
  onSelect: (pool: EnrichedPool) => void
}

export function PoolPickerModal({ isOpen, onClose, currentPool, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [version, setVersion] = useState<number | null>(null)
  // Default to "same chain" — most comparisons users want are
  // canonically-paired pools on the same network (USDC/USDT on Mainnet, ETH
  // staking pools on a single chain). They can toggle to All to explore
  // cross-chain TVL/fee differences for the same pair.
  const [chainScope, setChainScope] = useState<'same' | 'all'>('same')

  const filters = useMemo(
    () => ({
      search,
      chains: chainScope === 'same' ? [currentPool.chain] : [],
      types: [] as GqlPoolType[],
      protocolVersion: version,
      hookTypes: [] as string[],
      minTvl: 0,
    }),
    [search, chainScope, currentPool.chain, version]
  )

  const { loading, pageItems, filteredCount, totalCount } = usePoolExplorer({
    filters,
    sortKey: 'TVL',
    sortDir: 'desc',
    pageIndex: 0,
    // 200 keeps the dropdown rich without rendering the full 500 rows on
    // every keystroke — the cache holds the rest if we ever want them.
    pageSize: 200,
  })

  // Filter out the current pool so users can't compare it with itself.
  // We match on both `id` and `chain` — the explorer can hold the same
  // canonical id across forks; comparing v3 pool X on Mainnet vs v3 pool X
  // on Arbitrum is a legitimate cross-chain comparison and we don't want
  // to swallow that case.
  const items = useMemo(
    () =>
      pageItems
        .filter(
          p =>
            !(p.id.toLowerCase() === currentPool.id.toLowerCase() && p.chain === currentPool.chain)
        )
        .slice(0, PAGE_SIZE),
    [pageItems, currentPool.id, currentPool.chain]
  )

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size={{ base: 'sm', md: '3xl' }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>
          <VStack align="flex-start" spacing="xs">
            <Text fontSize="lg" fontWeight="bold">
              Compare with…
            </Text>
            <Text color="font.secondary" fontSize="xs" fontWeight="normal">
              Pick a pool to compare against {currentPool.name}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalBody pb={6}>
          <VStack align="stretch" spacing="md">
            <SearchInput
              ariaLabel="Search pools"
              autoFocus
              isLoading={loading}
              placeholder="Search by pool name, token symbol or address"
              search={search}
              setSearch={setSearch}
            />

            <Flex
              align={{ base: 'flex-start', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
              gap="sm"
              justify="space-between"
            >
              <HStack flexWrap="wrap" spacing="sm">
                <ButtonGroup
                  currentOption={versionToTab(version)}
                  groupId="pool-picker-version"
                  onChange={opt => setVersion(tabToVersion(opt.value))}
                  options={VERSION_TABS}
                  size="xxs"
                />
                <ButtonGroup
                  currentOption={chainScope === 'same' ? CHAIN_TABS[0] : CHAIN_TABS[1]}
                  groupId="pool-picker-chain"
                  onChange={opt => setChainScope(opt.value as 'same' | 'all')}
                  options={CHAIN_TABS}
                  size="xxs"
                />
              </HStack>
              <Text color="font.secondary" fontSize="2xs">
                {loading
                  ? 'Loading pools…'
                  : `${filteredCount.toLocaleString()} of ${totalCount.toLocaleString()} pools`}
              </Text>
            </Flex>

            <Box
              borderColor="border.base"
              borderWidth="1px"
              maxH="56vh"
              overflowY="auto"
              rounded="md"
            >
              {loading && items.length === 0 ? (
                <Flex align="center" justify="center" minH="200px">
                  <Spinner color="font.secondary" size="md" />
                </Flex>
              ) : items.length === 0 ? (
                <Flex align="center" justify="center" minH="200px" px="md">
                  <Text color="font.secondary" fontSize="sm" textAlign="center">
                    No pools match. Try a different search or widen to “All chains”.
                  </Text>
                </Flex>
              ) : (
                <Stack divider={undefined} spacing={0}>
                  {items.map((pool, i) => (
                    <PoolRow
                      first={i === 0}
                      key={`${pool.chain}-${pool.id}`}
                      onSelect={() => {
                        onSelect(pool)
                      }}
                      pool={pool}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const ROW_COLS = 'minmax(28px, 32px) minmax(220px, 1.4fr) minmax(120px, 0.7fr) 100px 100px'

function PoolRow({
  pool,
  onSelect,
  first,
}: {
  pool: EnrichedPool
  onSelect: () => void
  first: boolean
}) {
  const tvl = Number(pool.dynamicData.totalLiquidity ?? 0)
  const vol = Number(pool.dynamicData.volume24h ?? 0)
  const tokens = pool.poolTokens ?? []
  return (
    <Box
      _hover={{
        bg: 'background.level1',
        boxShadow: 'inset 2px 0 0 0 var(--chakra-colors-font-highlight)',
      }}
      borderColor="border.base"
      borderTop={first ? undefined : '1px solid'}
      cursor="pointer"
      onClick={onSelect}
      px={{ base: 'sm', md: 'md' }}
      py="sm"
      role="button"
      tabIndex={0}
      transition="background 0.15s, box-shadow 0.15s"
      w="full"
    >
      <Grid alignItems="center" gap={{ base: 'sm', md: 'ms' }} gridTemplateColumns={ROW_COLS}>
        <GridItem>
          <NetworkIcon chain={pool.chain} size={5} />
        </GridItem>
        <GridItem minW={0}>
          <VStack align="flex-start" minW={0} spacing="2xs">
            <PoolTokenPillsLite tokens={tokens} type={pool.type} />
            <HStack maxW="full" spacing="xs">
              <Text
                color="font.secondary"
                fontSize="xs"
                noOfLines={1}
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {pool.name || pool.symbol || pool.id}
              </Text>
            </HStack>
          </VStack>
        </GridItem>
        <GridItem>
          <HStack spacing="xs">
            <Badge
              fontSize="2xs"
              px="xs"
              py="0"
              rounded="full"
              textTransform="none"
              variant="outline"
            >
              v{pool.protocolVersion}
            </Badge>
            <Text color="font.secondary" fontSize="xs" noOfLines={1}>
              {formatPoolTypeLabel(pool.type)}
            </Text>
          </HStack>
        </GridItem>
        <GridItem justifySelf="end">
          <VStack align="flex-end" spacing="0">
            <Text fontSize="sm" fontWeight={500}>
              {usd(tvl)}
            </Text>
            <Text color="font.secondary" fontSize="2xs">
              TVL
            </Text>
          </VStack>
        </GridItem>
        <GridItem justifySelf="end">
          <VStack align="flex-end" spacing="0">
            <Text fontSize="sm" fontWeight={500}>
              {usd(vol)}
            </Text>
            <Text color="font.secondary" fontSize="2xs">
              Vol 24h
            </Text>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  )
}
