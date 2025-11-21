import { memo } from 'react'
import { HStack, Heading, Skeleton, VStack } from '@chakra-ui/react'
import { TokenIconStack } from '../../../../tokens/TokenIconStack'
import { TokenStackPopover } from '../../../../tokens/TokenStackPopover'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { usePool } from '../../../PoolProvider'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { isCowAmmPool } from '../../../pool.helpers'
import { useGetPoolRewards } from '../../../useGetPoolRewards'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { LabelWithTooltip } from '@repo/lib/shared/components/tooltips/LabelWithTooltip'
import { isBalancer } from '@repo/lib/config/getProjectConfig'
import { PoolTotalLiquidityDisplay } from '../../PoolTotalLiquidityDisplay'

type PoolStatsValues = {
  totalLiquidity: string
  volume24h: string
  income24h: string
  weeklyRewards: string
}

const MemoizedMainAprTooltip = memo(MainAprTooltip)

export function PoolSnapshotValues() {
  const { chain, pool, tvl, isLoading: isLoadingPool } = usePool()
  const { toCurrency } = useCurrency()

  const {
    tokens,
    weeklyRewards,
    weeklyRewardsByToken,
    isLoading: isLoadingTokens,
  } = useGetPoolRewards(pool)

  const poolStatsValues: PoolStatsValues | undefined = pool
    ? {
        totalLiquidity: toCurrency(tvl, { abbreviated: false }),
        volume24h: toCurrency(pool.dynamicData.volume24h, { abbreviated: false }),
        income24h: isCowAmmPool(pool.type)
          ? toCurrency(pool.dynamicData.surplus24h, { abbreviated: false, noDecimals: true })
          : toCurrency(pool.dynamicData.fees24h, { abbreviated: false, noDecimals: true }),
        weeklyRewards: weeklyRewards ? toCurrency(weeklyRewards.toString()) : 'N/A',
      }
    : undefined

  const incomeLabel = isCowAmmPool(pool.type) ? 'Surplus (24h)' : 'Swap fees (24h)'

  return (
    <>
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          <LabelWithTooltip
            label="TVL"
            tooltip="The Total Value Locked (TVL) of the pool. This is the sum of the value of all the assets in the pool."
          />
          {isLoadingPool && !Number(tvl) ? ( // Only show loading state when we have no TVL
            <Skeleton height="28px" w="100px" />
          ) : (
            <PoolTotalLiquidityDisplay
              size="h4"
              totalLiquidity={poolStatsValues?.totalLiquidity || ''}
            />
          )}
        </VStack>
      </FadeInOnView>
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          <LabelWithTooltip
            label="Swap vol (24h)"
            tooltip={`The swap volume routing through this pool over the last 24 hours from this UI and aggregator partners${isBalancer ? ' (like CowSwap)' : ''}. Unlike the daily chart, which tracks volume since the last UTC midnight, this number always reflects a full 24 hour period.`}
          />
          {poolStatsValues ? (
            <Heading size="h4">{poolStatsValues.volume24h}</Heading>
          ) : (
            <Skeleton height="28px" w="100px" />
          )}
        </VStack>
      </FadeInOnView>
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          <LabelWithTooltip
            label="APR for LPs"
            tooltip={`The APR for Liquidity Providers (LPs) based on the last 24h performance of the pool. It includes yield from various sources, including swap fees, staking incentives${isBalancer ? ", yield-bearing tokens and Merkl incentives. APR ranges are displayed for pools eligible for veBAL incentives. The lower range is the minimum range for people who don't stake or have no veBAL. The maximum rate is for veBAL holders with the max 2.5x veBAL boost." : ' and yield-bearing tokens.'}`}
          />
          <MemoizedMainAprTooltip
            aprItems={pool.dynamicData.aprItems}
            chain={pool.chain}
            height="28px"
            pool={pool}
            poolId={pool.id}
            textProps={{
              fontSize: ['xl', 'xl', '2xl'],
              fontWeight: 'bold',
              lineHeight: '28px',
            }}
          />
        </VStack>
      </FadeInOnView>
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          <LabelWithTooltip
            label={incomeLabel}
            tooltip={`The swap fees from trades routed through this pool over the last 24 hours from this UI and aggregator partners${isBalancer ? ' (like CowSwap)' : ''}. Unlike the daily fee chart, which tracks swap fees since the last UTC midnight, this number always reflects a full 24 hour period.`}
          />

          {poolStatsValues ? (
            <Heading size="h4">{poolStatsValues.income24h}</Heading>
          ) : (
            <Skeleton height="28px" w="100px" />
          )}
        </VStack>
      </FadeInOnView>
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          <LabelWithTooltip
            label="Weekly incentives"
            tooltip={`The weekly liquidity mining incentives for this pool. It includes incentives from ${isBalancer ? 'the Balancer Protocol (as determined by veBAL voting)' : 'Beets'} and from unaffiliated third parties. Users must stake to get these.`}
          />
          {poolStatsValues ? (
            <HStack>
              <Heading size="h4">
                {isLoadingTokens ? (
                  <Skeleton height="8" width="28" />
                ) : (
                  poolStatsValues.weeklyRewards
                )}
              </Heading>
              <TokenStackPopover
                chain={chain}
                headerText="Weekly incentives for stakers"
                rewardsByToken={weeklyRewardsByToken}
                tokens={tokens}
              >
                <TokenIconStack
                  chain={chain}
                  disablePopover
                  isLoading={isLoadingTokens}
                  size={20}
                  tokens={tokens}
                />
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
