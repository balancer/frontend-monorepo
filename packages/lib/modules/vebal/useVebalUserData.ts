import { GetVeBalUserDocument, GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useUserAccount } from '../web3/UserAccountProvider'
import { useQuery } from '@apollo/client'
import { bn } from '@repo/lib/shared/utils/numbers'

export function useVebalUserData() {
  const { userAddress, isConnected } = useUserAccount()

  const { data, refetch, loading, error } = useQuery(GetVeBalUserDocument, {
    variables: {
      address: userAddress.toLowerCase(),
      chain: GqlChain.Mainnet,
    },
  })

  const myVebalBalance = data?.veBalGetUser.balance
    ? bn(data.veBalGetUser.balance).toNumber()
    : undefined

  const hasVeBalBalance = myVebalBalance ? myVebalBalance > 0 : undefined

  const noVeBalBalance = typeof myVebalBalance === 'number' ? myVebalBalance === 0 : undefined

  return {
    data,
    refetch,
    isConnected, // FIXME: [JUANJO] we shouldn't return account data from here
    loading,
    error,
    myVebalBalance,
    hasVeBalBalance,
    noVeBalBalance,
  }
}
