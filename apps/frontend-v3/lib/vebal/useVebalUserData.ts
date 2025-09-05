import {
  GetVeBalUserDocument,
  GqlChain,
  GqlVeBalLockSnapshot,
} from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client'
import { useVeBALBalance } from './vote/useVeBALBalance'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { secondsToMilliseconds } from 'framer-motion'

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

  const snapshots = apiResponse.data?.veBalGetUser.lockSnapshots
  const lastLockTimestamp =
    snapshots && snapshots.length > 0
      ? secondsToMilliseconds(calculateLastLock(snapshots).timestamp)
      : undefined

  return {
    isLoading,
    veBALBalance: balanceResponse.veBALBalance,
    noVeBALBalance,
    rank: apiResponse.data?.veBalGetUser.rank,
    snapshots,
    lastLockTimestamp,
    refetch,
  }
}

function calculateLastLock(snapshots: GqlVeBalLockSnapshot[]) {
  const userLocks = [...snapshots].sort((a, b) => a.timestamp - b.timestamp)
  return userLocks[userLocks.length - 1]
}
