/* eslint-disable react-hooks/exhaustive-deps */
import { PaginatedTable } from '@repo/lib/shared/components/tables/PaginatedTable'
import { usePortfolio } from '../PortfolioProvider'
import { PortfolioTableHeader } from './PortfolioTableHeader'
import { PortfolioTableRow } from './PortfolioTableRow'
import {
  Box,
  Card,
  Center,
  Checkbox,
  Heading,
  HStack,
  Stack,
  Text,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { GqlPoolOrderBy, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { useVebalBoost } from '../../vebal/useVebalBoost'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { getUserTotalBalanceUsd, hasTinyBalance } from '../../pool/user-balance.helpers'
import { getTotalApr } from '../../pool/pool.utils'
import { ExpandedPoolInfo, ExpandedPoolType, useExpandedPools } from './useExpandedPools'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { ConnectWallet } from '../../web3/ConnectWallet'
import { getCanStake } from '../../pool/actions/stake.helpers'
import { bn } from '@repo/lib/shared/utils/numbers'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import {
  PortfolioFilters,
  PortfolioFilterTags,
  usePortfolioFilterTagsVisible,
} from './PortfolioFilters'
import { usePortfolioFilters } from './PortfolioFiltersProvider'
import { POOL_TYPE_MAP, PoolFilterType } from '../../pool/pool.types'
import { motion } from 'framer-motion'
import { poolTypeLabel } from '../../pool/pool.helpers'
import {
  StakingFilterKey,
  StakingFilterKeyType,
  STAKING_FILTER_MAP,
  STAKING_LABEL_MAP,
} from './useExpandedPools'

export type PortfolioTableSortingId = 'staking' | 'vebal' | 'liquidity' | 'apr'
export interface PortfolioSortingData {
  id: PortfolioTableSortingId | GqlPoolOrderBy
  desc: boolean
}

export const portfolioOrderByFn: (addExtraColumn: boolean) => {
  title: string
  id: PortfolioTableSortingId
}[] = (addExtraColumn: boolean) => [
  {
    title: 'Staking',
    id: 'staking',
  },
  ...(addExtraColumn
    ? [
        {
          title: 'veBAL boost',
          id: 'vebal' as PortfolioTableSortingId,
        },
      ]
    : []),
  {
    title: 'My liquidity',
    id: 'liquidity',
  },
  {
    title: 'APR',
    id: 'apr',
  },
]

const rowProps = (addExtraColumn: boolean) => ({
  px: [0, 4],
  gridTemplateColumns: `32px minmax(320px, 1fr) 180px 110px 110px ${addExtraColumn ? '130px' : ''} 170px`,
  alignItems: 'center',
  gap: { base: 'xxs', xl: 'lg' },
})

const generateStakingWeightForSort = (pool: ExpandedPoolInfo) => {
  const canStake = getCanStake(pool)

  if (canStake) {
    return (
      Number(pool.poolType === ExpandedPoolType.Unlocked) * 50 +
      Number(pool.poolType === ExpandedPoolType.StakedBal) * 20 +
      Number(pool.poolType === ExpandedPoolType.StakedAura) * 15 +
      Number(pool.poolType === ExpandedPoolType.Unstaked) * 10
    )
  } else {
    return 0 // send all pools without staking to the bottom of the table
  }
}

export function PortfolioTable() {
  const [shouldFilterTinyBalances, setShouldFilterTinyBalances] = useState(true)
  const { portfolioData, isLoadingPortfolio } = usePortfolio()
  const { isConnected } = useUserAccount()
  const isFilterVisible = usePortfolioFilterTagsVisible()
  const isMd = useBreakpointValue({ base: false, md: true })

  const {
    setAvailableNetworks,
    selectedNetworks,
    setAvailablePoolTypes,
    selectedPoolTypes,
    toggleNetwork,
    togglePoolType,
    toggleStakingType,
    setAvailableStakingTypes,
    selectedStakingTypes,
  } = usePortfolioFilters()

  const { projectName, options } = PROJECT_CONFIG

  const variants = {
    visible: {
      transform: isMd ? 'translateY(-40px)' : 'translateY(0)',
    },
    hidden: {
      transform: 'translateY(0)',
    },
  }

  // Filter out pools with tiny balances (<0.01 USD)
  const minUsdBalance = 0.01

  const filteredBalancePools = useMemo(
    () =>
      shouldFilterTinyBalances
        ? portfolioData.pools.filter(pool => !hasTinyBalance(pool, minUsdBalance))
        : portfolioData.pools,
    [portfolioData.pools, shouldFilterTinyBalances]
  )

  const expandedPools = useExpandedPools(filteredBalancePools)

  const availableNetworks = useMemo(
    () =>
      [...new Set(filteredBalancePools.map(pool => pool.chain))].sort((a, b) => a.localeCompare(b)),
    [filteredBalancePools]
  )

  useEffect(() => {
    setAvailableNetworks(availableNetworks)
  }, [availableNetworks])

  const availablePoolTypes = useMemo(() => {
    const gqlTypeToFilterKeyMap = new Map<GqlPoolType, PoolFilterType>()

    for (const key in POOL_TYPE_MAP) {
      const filterTypeKey = key as PoolFilterType
      const gqlTypes = POOL_TYPE_MAP[filterTypeKey]
      gqlTypes.forEach(gqlType => {
        gqlTypeToFilterKeyMap.set(gqlType, filterTypeKey)
      })
    }

    const foundFilterKeys = new Set<PoolFilterType>()

    filteredBalancePools.forEach(pool => {
      if (pool.type) {
        const filterKey = gqlTypeToFilterKeyMap.get(pool.type)
        if (filterKey) {
          foundFilterKeys.add(filterKey)
        }
      }
    })

    return Array.from(foundFilterKeys).sort((a, b) =>
      poolTypeLabel(a).localeCompare(poolTypeLabel(b))
    )
  }, [filteredBalancePools])

  useEffect(() => {
    setAvailablePoolTypes(availablePoolTypes)
  }, [availablePoolTypes])

  const availableStakingTypes = useMemo(() => {
    const foundFilterKeys = new Set<StakingFilterKeyType>()

    expandedPools.forEach(pool => {
      if (pool.poolType) {
        if (
          pool.poolType === ExpandedPoolType.StakedBal ||
          pool.poolType === ExpandedPoolType.StakedAura
        ) {
          foundFilterKeys.add(StakingFilterKey.Staked)
        } else if (pool.poolType === ExpandedPoolType.Locked) {
          foundFilterKeys.add(StakingFilterKey.Locked)
        } else if (pool.poolType === ExpandedPoolType.Unlocked) {
          foundFilterKeys.add(StakingFilterKey.Unlocked)
        } else if (pool.poolType === ExpandedPoolType.Unstaked) {
          foundFilterKeys.add(StakingFilterKey.Unstaked)
        } else if (pool.poolType === ExpandedPoolType.Default) {
          foundFilterKeys.add(StakingFilterKey.Default)
        }
      }
    })

    // Sort the staking types alphabetically with 'Default' coming last
    const defaultValue = StakingFilterKey.Default

    return Array.from(foundFilterKeys).sort((a, b) => {
      if (a === defaultValue && b === defaultValue) {
        return 0
      }
      if (a === defaultValue) {
        return 1 // a is default, should come after b
      }
      if (b === defaultValue) {
        return -1 // b is default, should come after a
      }
      // Neither is default, sort alphabetically by label
      return STAKING_LABEL_MAP[a].localeCompare(STAKING_LABEL_MAP[b])
    })
  }, [expandedPools, setAvailableStakingTypes]) // Add setAvailableStakingTypes dependency

  useEffect(() => {
    setAvailableStakingTypes(availableStakingTypes)
  }, [availableStakingTypes])

  const hasTinyBalances = portfolioData.pools.some(pool => hasTinyBalance(pool, minUsdBalance))

  const { veBalBoostMap } = useVebalBoost(portfolioData.stakedPools)

  const [currentSortingObj, setCurrentSortingObj] = useState<PortfolioSortingData>({
    id: 'staking',
    desc: true,
  })

  const sortedPools = useMemo(() => {
    if (!portfolioData?.pools) return []
    let arr = [...expandedPools]

    // Filter by selected networks if any are selected
    if (selectedNetworks.length > 0) {
      arr = arr.filter(pool => selectedNetworks.includes(pool.chain))
    }

    // Filter by selected pool types if any are selected
    if (selectedPoolTypes.length > 0) {
      arr = arr.filter(pool =>
        selectedPoolTypes.some(selectedFilterKey => {
          const correspondingGqlTypes = POOL_TYPE_MAP[selectedFilterKey]

          return correspondingGqlTypes && correspondingGqlTypes.includes(pool.type)
        })
      )
    }

    // Filter by selected staking types if any are selected
    if (selectedStakingTypes.length > 0) {
      // Get all ExpandedPoolType values corresponding to the selected filter keys
      const targetPoolTypes = selectedStakingTypes.flatMap(key => STAKING_FILTER_MAP[key])
      arr = arr.filter(pool => targetPoolTypes.includes(pool.poolType))
    }

    return arr.sort((a, b) => {
      if (currentSortingObj.id === 'staking') {
        const isALocked = a.poolType === ExpandedPoolType.Locked
        const isBLocked = b.poolType === ExpandedPoolType.Locked

        // Prioritize Locked pools regardless of canStake status
        if (currentSortingObj.desc) {
          if (isALocked && !isBLocked) return -1 // A (Locked) comes before B
          if (!isALocked && isBLocked) return 1 // B (Locked) comes before A
        } else {
          // Ascending sort (Locked comes last)
          if (isALocked && !isBLocked) return 1 // A (Locked) comes after B
          if (!isALocked && isBLocked) return -1 // B (Locked) comes after A
        }

        // If both are Locked or neither is Locked, use the weight function
        const aStakingWeight = generateStakingWeightForSort(a)
        const bStakingWeight = generateStakingWeightForSort(b)

        const weightDiff = currentSortingObj.desc
          ? bStakingWeight - aStakingWeight
          : aStakingWeight - bStakingWeight

        // If weights are equal, use veBAL boost as a tie-breaker (higher boost first)
        if (weightDiff === 0) {
          const aVebalBoost = Number(veBalBoostMap?.[a.id] || 0)
          const bVebalBoost = Number(veBalBoostMap?.[b.id] || 0)
          // Always sort by boost descending, regardless of primary sort direction
          return bVebalBoost - aVebalBoost
        }

        return weightDiff
      }

      if (currentSortingObj.id === 'vebal') {
        const aVebalBoost = Number(veBalBoostMap?.[a.id] || 0)
        const bVebalBoost = Number(veBalBoostMap?.[b.id] || 0)
        return currentSortingObj.desc ? bVebalBoost - aVebalBoost : aVebalBoost - bVebalBoost
      }

      if (currentSortingObj.id === 'liquidity') {
        const aTotalBalance = getUserTotalBalanceUsd(a)
        const bTotalBalance = getUserTotalBalanceUsd(b)

        return currentSortingObj.desc
          ? bTotalBalance - aTotalBalance
          : aTotalBalance - bTotalBalance
      }

      if (currentSortingObj.id === 'apr') {
        const [aApr] =
          a.poolType === ExpandedPoolType.StakedAura
            ? [a.staking?.aura?.apr ?? 0]
            : getTotalApr(a.dynamicData.aprItems)
        const [bApr] =
          b.poolType === ExpandedPoolType.StakedAura
            ? [b.staking?.aura?.apr ?? 0]
            : getTotalApr(b.dynamicData.aprItems)
        return currentSortingObj.desc
          ? bn(bApr).minus(aApr).toNumber()
          : bn(aApr).minus(bApr).toNumber()
      }

      return 0
    })
  }, [
    portfolioData?.pools,
    expandedPools,
    currentSortingObj.id,
    currentSortingObj.desc,
    veBalBoostMap,
  ])

  return (
    <FadeInOnView>
      <VStack align="start" minHeight="1000px" spacing="md" w="full">
        <Stack
          alignItems={isFilterVisible ? 'flex-end' : 'flex-start'}
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          w="full"
        >
          <VStack align="start" flex={1} pb={{ base: 'sm', md: '0' }} w="full">
            <HStack w="full">
              <Box position="relative" top="0">
                <Box
                  animate={isFilterVisible ? 'visible' : 'hidden'}
                  as={motion.div}
                  left="0"
                  minW={{ base: 'auto', md: '270px' }}
                  position={{ base: 'relative', md: 'absolute' }}
                  top="0"
                  transition="all 0.15s var(--ease-out-cubic)"
                  variants={variants}
                  willChange="transform"
                >
                  <Heading
                    as="h2"
                    size="lg"
                    variant="special"
                    w="full"
                  >{`${projectName} portfolio`}</Heading>
                </Box>
              </Box>
            </HStack>
            <PortfolioFilterTags
              networks={selectedNetworks}
              poolTypes={selectedPoolTypes}
              stakingTypes={selectedStakingTypes}
              toggleNetwork={toggleNetwork}
              togglePoolType={togglePoolType}
              toggleStakingType={toggleStakingType}
            />
          </VStack>

          <Stack
            align={{ base: 'end', sm: 'center' }}
            direction="row"
            w={{ base: 'full', md: 'auto' }}
          >
            <PortfolioFilters />
          </Stack>
        </Stack>
        {isConnected ? (
          <Card
            alignItems="flex-start"
            left={{ base: '-4px', sm: '0' }}
            p={{ base: '0', sm: '0' }}
            position="relative"
            // fixing right padding for horizontal scroll on mobile
            pr={{ base: 'lg', sm: 'lg', md: 'lg', lg: '0' }}
            w={{ base: '100vw', lg: 'full' }}
          >
            <PaginatedTable
              alignItems="flex-start"
              getRowId={row => row.uniqueKey}
              items={sortedPools}
              left={{ base: '-4px', sm: '0' }}
              loading={isLoadingPortfolio}
              noItemsFoundLabel="No pools found"
              paginationProps={null}
              position="relative"
              renderTableHeader={() => (
                <PortfolioTableHeader
                  currentSortingObj={currentSortingObj}
                  setCurrentSortingObj={setCurrentSortingObj}
                  {...rowProps(options.showVeBal)}
                />
              )}
              renderTableRow={({ item, index }) => {
                return (
                  <PortfolioTableRow
                    keyValue={index}
                    pool={item}
                    veBalBoostMap={veBalBoostMap}
                    {...rowProps(options.showVeBal)}
                  />
                )
              }}
              showPagination={false}
              w={{ base: '100vw', lg: 'full' }}
            />
          </Card>
        ) : (
          <Center border="1px dashed" borderColor="border.base" h="400px" rounded="lg" w="full">
            <Box>
              <ConnectWallet size="lg" variant="primary" />
            </Box>
          </Center>
        )}
        {hasTinyBalances && (
          <Checkbox
            isChecked={shouldFilterTinyBalances}
            onChange={() => {
              setShouldFilterTinyBalances(!shouldFilterTinyBalances)
            }}
            size="lg"
          >
            <Text fontSize="md" variant="secondary">
              Hide pools under $0.01
            </Text>
          </Checkbox>
        )}
      </VStack>
    </FadeInOnView>
  )
}
