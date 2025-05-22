'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from '@repo/lib/shared/hooks/useReadContractHelper'
import { sonicStakingAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useGetConvertToAssets(sharesAmount: bigint, chain: GqlChain) {
  const { isConnected } = useUserAccount()
  const chainId = getChainId(chain)

  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: sonicStakingAbi,
    address: config.contracts.beets?.lstStakingProxy,
    functionName: 'convertToAssets',
    args: [sharesAmount],
    enabled: isConnected && !shouldChangeNetwork && !!sharesAmount,
  })

  return {
    ...query,
    assetsAmount: query.data ?? 0n,
  }
}
