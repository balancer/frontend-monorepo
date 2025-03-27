import { Pool } from './pool.types'
import { GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { sumBy } from 'lodash'
import { useTokens } from '../tokens/TokensProvider'
import { bn, Numberish } from '@repo/lib/shared/utils/numbers'
import { calcPotentialYieldFor } from './pool.utils'
import { oneWeekInSecs } from '@repo/lib/shared/utils/time'

export function useGetPoolRewards(pool: Pool) {
  const { priceFor, getToken } = useTokens()

  const currentRewards = pool.staking?.gauge?.rewards || []

  const currentRewardsPerWeek = currentRewards.map(reward => {
    return {
      ...reward,
      rewardPerWeek: bn(reward.rewardPerSecond).times(oneWeekInSecs),
    }
  })

  // In case a reward token is undefined, it's icon in TokenIconStack will be a random one
  const tokens = currentRewardsPerWeek
    .filter(reward => bn(reward.rewardPerSecond).gt(0))
    .map(reward => getToken(reward.tokenAddress, pool.chain)) as GqlToken[]

  const weeklyRewards = sumBy(currentRewardsPerWeek, reward =>
    bn(priceFor(reward.tokenAddress, pool.chain)).times(reward.rewardPerWeek).toNumber()
  )

  // Map token addresses to their weekly reward amounts
  const weeklyRewardsByToken = Object.fromEntries(
    currentRewards.map(reward => [
      reward.tokenAddress,
      reward.rewardPerSecond ? bn(reward.rewardPerSecond).times(oneWeekInSecs).toString() : '0',
    ])
  )

  function calculatePotentialYield(totalUSDValue: Numberish) {
    const potentialYield = calcPotentialYieldFor(pool, totalUSDValue)
    const weeklyYield =
      weeklyRewards && bn(potentialYield).gt(weeklyRewards)
        ? weeklyRewards.toString()
        : potentialYield
    return weeklyYield
  }

  return {
    tokens,
    weeklyRewards,
    weeklyRewardsByToken,
    calculatePotentialYield,
  }
}
