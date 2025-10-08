'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { loopedSonicVaultAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useLoopsGetConvertToAssets(assetAmount: bigint, chain: GqlChain) {
  const { isConnected } = useUserAccount()
  const chainId = getChainId(chain)

  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: loopedSonicVaultAbi,
    address: config.contracts.beets?.loopedSonicVault,
    functionName: 'convertToAssets',
    args: [assetAmount],
    query: { enabled: isConnected && !shouldChangeNetwork && !!assetAmount },
  })

  return {
    ...query,
    assetsAmount: query.data ?? 0n,
  }
}
