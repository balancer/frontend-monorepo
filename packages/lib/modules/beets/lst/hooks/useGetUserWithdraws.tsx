'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'
import { sonicStakingAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export type UserWithdraw = {
  assetAmount: bigint
  isWithdrawn: boolean
  kind: number // 0 = POOL
  requestTimestamp: bigint
  user: string
  validatorId: bigint
}

export function useGetUserWithdraws(chain: GqlChain, userNumWithdraws: bigint | undefined) {
  const { isConnected, userAddress } = useUserAccount()
  const chainId = getChainId(chain)

  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: sonicStakingAbi,
    address: config.contracts.beets?.lstStakingProxy,
    functionName: 'getUserWithdraws',
    args: [userAddress, 0n, userNumWithdraws || 0n, false],
    query: { enabled: isConnected && !shouldChangeNetwork && !!userAddress && !!userNumWithdraws },
  })

  return {
    ...query,
    userWithdraws: (query.data as UserWithdraw[]) ?? [],
  }
}
