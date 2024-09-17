'use client'

import React, { memo, useMemo } from 'react'
import { HStack, Heading, Skeleton, Text, VStack } from '@chakra-ui/react'
import { GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { TokenIconStack } from '../../../../tokens/TokenIconStack'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { SECONDS_IN_DAY } from '@/test/utils/numbers'
import { sumBy } from 'lodash'
import { useTokens } from '../../../../tokens/TokensProvider'
import { usePool } from '../../../PoolProvider'
import { bn } from '@/lib/shared/utils/numbers'
import MainAprTooltip from '@/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { isCowAmmPool } from '../../../pool.helpers'
import { getPoolDisplayTokens } from '../../../pool.utils'

type PoolStatsValues = {
  totalLiquidity: string
  income24h: string
  weeklyRewards: string
}

export function PoolSnapshotValues() {
  const { pool, chain } = usePool()
  const { toCurrency } = useCurrency()
  const { priceFor, getToken, calcTotalUsdValue } = useTokens()

  const MemoizedMainAprTooltip = memo(MainAprTooltip)

  const currentRewards = pool.staking?.gauge?.rewards || []

  const currentRewardsPerWeek = currentRewards.map(reward => {
    return {
      ...reward,
      rewardPerWeek: parseFloat(reward.rewardPerSecond) * SECONDS_IN_DAY * 7,
    }
  })

  // In case a reward token is undefined, it's icon in TokenIconStack will be a random one
  const tokens = currentRewardsPerWeek
    .filter(reward => bn(reward.rewardPerSecond).gt(0))
    .map(reward => getToken(reward.tokenAddress, chain)) as GqlToken[]

  const weeklyRewards = sumBy(
    currentRewardsPerWeek,
    reward => priceFor(reward.tokenAddress, chain) * reward.rewardPerWeek
  )

  const poolStatsValues: PoolStatsValues | undefined = useMemo(() => {
    if (pool) {
      return {
        totalLiquidity: toCurrency(calcTotalUsdValue(getPoolDisplayTokens(pool), chain), {
          abbreviated: false,
        }),
        income24h: isCowAmmPool(pool.type)
          ? toCurrency(pool.dynamicData.surplus24h)
          : toCurrency(pool.dynamicData.fees24h),
        weeklyRewards: toCurrency(weeklyRewards),
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool])

  const incomeLabel = isCowAmmPool(pool.type) ? 'Surplus (24h)' : 'Fees (24h)'

  return (
    <>
      <VStack spacing="0" align="flex-start" w="full">
        <Text variant="secondary" fontWeight="semibold" fontSize="sm" mt="xxs">
          TVL
        </Text>
        {poolStatsValues ? (
          <Heading size="h4">{poolStatsValues.totalLiquidity}</Heading>
        ) : (
          <Skeleton height="30px" w="100px" />
        )}
      </VStack>
      <VStack spacing="0" align="flex-start" w="full">
        <Text variant="secondary" fontWeight="semibold" fontSize="sm" mt="xxs">
          APR for LPs
        </Text>
        <MemoizedMainAprTooltip
          aprItems={pool.dynamicData.aprItems}
          poolId={pool.id}
          height="28px"
          textProps={{
            fontWeight: 'bold',
            fontSize: '2xl',
            lineHeight: '28px',
          }}
          pool={pool}
        />
      </VStack>
      <VStack spacing="0" align="flex-start" w="full">
        <Text variant="secondary" fontWeight="semibold" fontSize="sm" mt="xxs">
          {incomeLabel}
        </Text>
        {poolStatsValues ? (
          <Heading size="h4">{poolStatsValues.income24h}</Heading>
        ) : (
          <Skeleton height="30px" w="100px" />
        )}
      </VStack>
      <VStack spacing="0" align="flex-start" w="full">
        <Text variant="secondary" fontWeight="semibold" fontSize="sm" mt="xxs">
          Weekly incentives
        </Text>
        {poolStatsValues ? (
          <HStack>
            <Heading size="h4">
              {poolStatsValues.weeklyRewards ? poolStatsValues.weeklyRewards : 'N/A'}
            </Heading>
            <TokenIconStack tokens={tokens} chain={chain} size={20} />
          </HStack>
        ) : (
          <Skeleton height="30px" w="100px" />
        )}
      </VStack>
    </>
  )
}
