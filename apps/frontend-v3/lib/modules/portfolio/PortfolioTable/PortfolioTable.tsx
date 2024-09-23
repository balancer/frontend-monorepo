import { PaginatedTable } from '@/lib/shared/components/tables/PaginatedTable'
import { usePortfolio } from '../PortfolioProvider'
import { PortfolioTableHeader } from './PortfolioTableHeader'
import { PortfolioTableRow } from './PortfolioTableRow'
import { Card, Center, Checkbox, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { GqlPoolOrderBy } from '@/lib/shared/services/api/generated/graphql'
import { useVebalBoost } from '../../vebal/useVebalBoost'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'
import {
  getUserTotalBalanceUsd,
  hasAuraStakedBalance,
  hasBalancerStakedBalance,
  hasTinyBalance,
} from '../../pool/user-balance.helpers'
import { getTotalApr } from '../../pool/pool.utils'
import { ExpandedPoolInfo, ExpandedPoolType, useExpandedPools } from './useExpandedPools'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { ConnectWallet } from '../../web3/ConnectWallet'
import { getCanStake } from '../../pool/actions/stake.helpers'

export type PortfolioTableSortingId = 'staking' | 'vebal' | 'liquidity' | 'apr'
export interface PortfolioSortingData {
  id: PortfolioTableSortingId | GqlPoolOrderBy
  desc: boolean
}

export const portfolioOrderBy: {
  title: string
  id: PortfolioTableSortingId
}[] = [
  {
    title: 'Staking',
    id: 'staking',
  },
  {
    title: 'veBAL boost',
    id: 'vebal',
  },
  {
    title: 'My liquidity',
    id: 'liquidity',
  },
  {
    title: 'APR',
    id: 'apr',
  },
]

const rowProps = {
  px: [0, 4],
  gridTemplateColumns: `32px minmax(320px, 1fr) repeat(2, 100px) 120px 130px 170px`,
  alignItems: 'center',
  gap: { base: 'xxs', xl: 'lg' },
}

const generateStakingWeightForSort = (pool: ExpandedPoolInfo) => {
  const canStake = getCanStake(pool)

  if (canStake) {
    return (
      Number(pool.poolType === ExpandedPoolType.Locked) * 100 +
      Number(pool.poolType === ExpandedPoolType.Unlocked) * 50 +
      Number(pool.poolType === ExpandedPoolType.StakedAura) * 20 +
      Number(pool.poolType === ExpandedPoolType.StakedBal) * 15 +
      Number(pool.poolType === ExpandedPoolType.Unstaked) * 10 +
      Number(hasAuraStakedBalance(pool)) * 2 +
      Number(hasBalancerStakedBalance(pool))
    )
  } else {
    return 0 // send all pools without staking to the bottom of the table
  }
}

export function PortfolioTable() {
  const [shouldFilterTinyBalances, setShouldFilterTinyBalances] = useState(true)
  const { portfolioData, isLoadingPortfolio } = usePortfolio()
  const { isConnected } = useUserAccount()

  // Filter out pools with tiny balances (<0.01 USD)
  const minUsdBalance = 0.01
  const filteredBalancePools = shouldFilterTinyBalances
    ? portfolioData.pools.filter(pool => !hasTinyBalance(pool, minUsdBalance))
    : portfolioData.pools

  const expandedPools = useExpandedPools(filteredBalancePools)

  const hasTinyBalances = portfolioData.pools.some(pool => hasTinyBalance(pool, minUsdBalance))

  const { veBalBoostMap } = useVebalBoost(portfolioData.stakedPools)

  const [currentSortingObj, setCurrentSortingObj] = useState<PortfolioSortingData>({
    id: 'staking',
    desc: true,
  })

  const sortedPools = useMemo(() => {
    if (!portfolioData?.pools) return []
    const arr = [...expandedPools]

    return arr.sort((a, b) => {
      if (currentSortingObj.id === 'staking') {
        const aStakingWeight = generateStakingWeightForSort(a)
        const bStakingWeight = generateStakingWeightForSort(b)

        return currentSortingObj.desc
          ? bStakingWeight - aStakingWeight
          : aStakingWeight - bStakingWeight
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
        const [aApr] = getTotalApr(a.dynamicData.aprItems)
        const [bApr] = getTotalApr(b.dynamicData.aprItems)

        return currentSortingObj.desc ? bApr.minus(aApr).toNumber() : aApr.minus(bApr).toNumber()
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
      <Stack gap={5}>
        <HStack>
          <Heading size="lg">Balancer portfolio</Heading>
        </HStack>
        {isConnected ? (
          <Card
            p={{ base: '0', sm: '0' }}
            w={{ base: '100vw', lg: 'full' }}
            alignItems="flex-start"
            position="relative"
            left={{ base: '-4px', sm: '0' }}
          >
            <PaginatedTable
              items={sortedPools}
              loading={isLoadingPortfolio}
              renderTableHeader={() => (
                <PortfolioTableHeader
                  currentSortingObj={currentSortingObj}
                  setCurrentSortingObj={setCurrentSortingObj}
                  {...rowProps}
                />
              )}
              renderTableRow={(item: ExpandedPoolInfo, index) => {
                return (
                  <PortfolioTableRow
                    keyValue={index}
                    pool={item}
                    veBalBoostMap={veBalBoostMap}
                    {...rowProps}
                  />
                )
              }}
              showPagination={false}
              paginationProps={null}
              w={{ base: '100vw', lg: 'full' }}
              alignItems="flex-start"
              position="relative"
              left={{ base: '-4px', sm: '0' }}
              noItemsFoundLabel="No pools found"
            />
          </Card>
        ) : (
          <Center h="400px" border="1px dashed" borderColor="border.base" rounded="lg">
            <ConnectWallet variant="primary" size="lg" />
          </Center>
        )}
        {hasTinyBalances && (
          <Checkbox
            size="lg"
            isChecked={shouldFilterTinyBalances}
            onChange={() => {
              setShouldFilterTinyBalances(!shouldFilterTinyBalances)
            }}
          >
            <Text variant="secondary" fontSize="md">
              Hide pools under $0.01
            </Text>
          </Checkbox>
        )}
      </Stack>
    </FadeInOnView>
  )
}
