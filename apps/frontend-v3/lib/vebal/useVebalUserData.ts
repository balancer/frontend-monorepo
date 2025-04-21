import { GetVeBalUserDocument, GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client'
import { useVeBALBalance } from './vote/useVeBALBalance'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'

export function useVebalUserData() {
  const { userAddress } = useUserAccount()

  const apiResponse = useQuery(GetVeBalUserDocument, {
    variables: {
      address: userAddress.toLowerCase(),
      chain: GqlChain.Mainnet,
    },
  })

  const balanceResponse = useVeBALBalance(userAddress)
  const noVeBALBalance = balanceResponse.veBALBalance === 0n

  const isLoading = apiResponse.loading || balanceResponse.isLoading
  const refetch = () => {
    apiResponse.refetch()
    balanceResponse.refetch()
  }

  return {
    isLoading,
    veBALBalance: balanceResponse.veBALBalance,
    noVeBALBalance,
    rank: apiResponse.data?.veBalGetUser.rank,
    snapshots: apiResponse.data?.veBalGetUser.lockSnapshots,
    refetch,
  }
}
