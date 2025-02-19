import { Pool } from './pool.types'
import { GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { sumBy } from 'lodash'
import { useTokens } from '../tokens/TokensProvider'
import { SECONDS_IN_DAY } from '@repo/lib/test/utils/numbers'
import { bn } from '@repo/lib/shared/utils/numbers'

export function useGetPoolRewards(pool: Pool) {
  const { priceFor, getToken } = useTokens()

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
    .map(reward => getToken(reward.tokenAddress, pool.chain)) as GqlToken[]

  const weeklyRewards = sumBy(
    currentRewardsPerWeek,
    reward => priceFor(reward.tokenAddress, pool.chain) * reward.rewardPerWeek
  )

  return {
    tokens,
    weeklyRewards,
  }
}
