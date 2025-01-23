'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { sonicStakingWithdrawRequestHelperAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useBatchedReadContract } from '@repo/lib/modules/web3/useBatchedReadContract'

export type UserWithdraw = {
  id: bigint
  assetAmount: bigint
  isWithdrawn: boolean
  kind: number // 0 = POOL
  requestTimestamp: bigint
  user: string
  validatorId: bigint
}

export function useGetUserWithdraws(
  chain: GqlChain,
  userNumWithdraws: bigint | undefined,
  enabled: boolean
) {
  const { isConnected, userAddress } = useUserAccount()
  const chainId = getChainId(chain)

  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const query = useBatchedReadContract({
    chainId,
    abi: sonicStakingWithdrawRequestHelperAbi,
    address: config.contracts.beets?.lstWithdrawRequestHelper,
    functionName: 'getUserWithdraws',
    args: [userAddress, 0n, userNumWithdraws || 0n, false],
    query: {
      enabled:
        isConnected && !shouldChangeNetwork && !!userAddress && !!userNumWithdraws && !!enabled,
    },
  })

  return {
    ...query,
    userWithdraws: (query.data as UserWithdraw[]) ?? [],
  }
}
