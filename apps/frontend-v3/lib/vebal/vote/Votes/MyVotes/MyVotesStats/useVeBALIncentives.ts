import { GqlPoolAprItemType } from '@repo/lib/shared/services/api/generated/graphql'
import { useVeBALPool } from './useVeBALPool'

type Incentives = { type: GqlPoolAprItemType; apr: number }

function findIncentive(incentives: Incentives[], type: GqlPoolAprItemType) {
  if (!incentives) return undefined

  const incentive = incentives.find(incentive => incentive.type === type)
  return incentive?.apr
}

export function useVeBALIncentives(userAddress: string) {
  const { pool, poolIsLoading } = useVeBALPool(userAddress)

  const results = pool?.dynamicData.aprItems as Incentives[]

  const incentives = {
    swapFee: findIncentive(results, GqlPoolAprItemType.SwapFee_24H),
    locking: findIncentive(results, GqlPoolAprItemType.Locking),
    voting: findIncentive(results, GqlPoolAprItemType.Voting),
  }

  return { incentives, incentivesAreLoading: poolIsLoading }
}
