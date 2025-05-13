'use client'

import { memo, useMemo } from 'react'
import { HStack, Heading, Skeleton, Text, VStack } from '@chakra-ui/react'
import { TokenIconStack } from '../../../../tokens/TokenIconStack'
import { TokenStackPopover } from '../../../../tokens/TokenStackPopover'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { usePool } from '../../../PoolProvider'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { isCowAmmPool } from '../../../pool.helpers'
import { useGetPoolRewards } from '../../../useGetPoolRewards'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

type PoolStatsValues = {
  totalLiquidity: string
  volume24h: string
  income24h: string
  weeklyRewards: string
}

export function PoolSnapshotValues() {
  const { chain, pool, tvl } = usePool()
  const { toCurrency } = useCurrency()

  const MemoizedMainAprTooltip = memo(MainAprTooltip)

  const { tokens, weeklyRewards, weeklyRewardsByToken } = useGetPoolRewards(pool)

  const poolStatsValues: PoolStatsValues | undefined = useMemo(() => {
    if (pool) {
      return {
        totalLiquidity: toCurrency(tvl, {
          abbreviated: false,
        }),
        volume24h: toCurrency(pool.dynamicData.volume24h, {
          abbreviated: false,
        }),
        income24h: isCowAmmPool(pool.type)
          ? toCurrency(pool.dynamicData.surplus24h, { abbreviated: false, noDecimals: true })
          : toCurrency(pool.dynamicData.fees24h, { abbreviated: false, noDecimals: true }),
        weeklyRewards: weeklyRewards ? toCurrency(weeklyRewards.toString()) : 'N/A',
      }
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, tvl, weeklyRewards])

  const incomeLabel = isCowAmmPool(pool.type) ? 'Surplus (24h)' : 'Fees (24h)'

  return (
    <>
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
            TVL
          </Text>
          {poolStatsValues ? (
            <Heading size="h4">{poolStatsValues.totalLiquidity}</Heading>
          ) : (
            <Skeleton height="28px" w="100px" />
          )}
        </VStack>
      </FadeInOnView>
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
            Swap vol (24h)
          </Text>
          {poolStatsValues ? (
            <Heading size="h4">{poolStatsValues.volume24h}</Heading>
          ) : (
            <Skeleton height="28px" w="100px" />
          )}
        </VStack>
      </FadeInOnView>
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
            APR for LPs
          </Text>
          <MemoizedMainAprTooltip
            aprItems={pool.dynamicData.aprItems}
            chain={pool.chain}
            height="28px"
            pool={pool}
            poolId={pool.id}
            textProps={{
              fontSize: '2xl',
              fontWeight: 'bold',
              lineHeight: '28px',
            }}
          />
        </VStack>
      </FadeInOnView>
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
            {incomeLabel}
          </Text>
          {poolStatsValues ? (
            <Heading size="h4">{poolStatsValues.income24h}</Heading>
          ) : (
            <Skeleton height="28px" w="100px" />
          )}
        </VStack>
      </FadeInOnView>
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
            Weekly incentives
          </Text>
          {poolStatsValues ? (
            <HStack>
              <Heading size="h4">
                {poolStatsValues.weeklyRewards ? poolStatsValues.weeklyRewards : 'N/A'}
              </Heading>
              <TokenStackPopover
                chain={chain}
                headerText="Weekly incentives for stakers"
                rewardsByToken={weeklyRewardsByToken}
                tokens={tokens}
              >
                <TokenIconStack chain={chain} disablePopover size={20} tokens={tokens} />
              </TokenStackPopover>
            </HStack>
          ) : (
            <Skeleton height="28px" w="100px" />
          )}
        </VStack>
      </FadeInOnView>
    </>
  )
}
