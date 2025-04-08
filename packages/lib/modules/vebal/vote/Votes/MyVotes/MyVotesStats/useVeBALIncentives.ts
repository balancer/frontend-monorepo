import { useQuery } from '@apollo/client'
import {
  GetPoolDocument,
  GqlChain,
  GqlPoolAprItemType,
} from '@repo/lib/shared/services/api/generated/graphql'

const VEBAL_UNDERLYING_POOL = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014'

type Incentives = { type: GqlPoolAprItemType; apr: number }

function findIncentive(incentives: Incentives[], type: GqlPoolAprItemType) {
  if (!incentives) return undefined

  const incentive = incentives.find(incentive => incentive.type === type)
  return incentive?.apr || undefined
}

export function useVeBALIncentives(userAddress: string) {
  const { data, loading } = useQuery(GetPoolDocument, {
    variables: {
      id: VEBAL_UNDERLYING_POOL,
      chain: GqlChain.Mainnet,
      userAddress: userAddress.toLowerCase(),
    },
  })

  const results = data?.pool.dynamicData.aprItems as Incentives[]

  const incentives = {
    swap24Hours: findIncentive(results, GqlPoolAprItemType.SwapFee_24H),
    swap7Days: findIncentive(results, GqlPoolAprItemType.SwapFee_7D),
    swap30Days: findIncentive(results, GqlPoolAprItemType.SwapFee_30D),
    locking: findIncentive(results, GqlPoolAprItemType.Locking),
    voting: findIncentive(results, GqlPoolAprItemType.Voting),
  }

  return { incentives, incentivesAreLoading: loading }
}
