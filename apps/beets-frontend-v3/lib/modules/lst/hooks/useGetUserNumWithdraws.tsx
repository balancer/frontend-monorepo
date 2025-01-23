'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useBatchedReadContract } from '@repo/lib/modules/web3/useBatchedReadContract'
import { sonicStakingAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useGetUserNumWithdraws(chain: GqlChain, enabled: boolean) {
  const chainId = getChainId(chain)

  const { isConnected, userAddress } = useUserAccount()
  const { shouldChangeNetwork } = useChainSwitch(chainId)

  const config = getNetworkConfig(chainId)

  const query = useBatchedReadContract({
    chainId,
    abi: sonicStakingAbi,
    address: config.contracts.beets?.lstStakingProxy,
    functionName: 'userNumWithdraws',
    args: [userAddress],
    query: { enabled: isConnected && !shouldChangeNetwork && !!userAddress && !!enabled },
  })

  return {
    ...query,
    userNumWithdraws: query.data,
  }
}
