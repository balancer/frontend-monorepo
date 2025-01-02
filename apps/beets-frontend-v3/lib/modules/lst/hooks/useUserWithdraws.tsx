'use client'

import { getNetworkConfig } from '@repo/lib/config/app.config'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'
import { sonicStakingAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'

export function useUserWithdraws(index: number) {
  const { isConnected, userAddress, chainId } = useUserAccount()

  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: sonicStakingAbi,
    address: config.contracts.beets?.lstStakingProxy,
    functionName: 'userWithdraws',
    args: [userAddress, BigInt(index) || 0n],
    query: { enabled: isConnected && !!index },
  })

  return {
    ...query,
    withdrawId: (query.data as bigint) ?? 0n,
  }
}
