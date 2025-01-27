import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useGetLevelInfo(chain: GqlChain, poolId: string | undefined) {
  const { isConnected, userAddress } = useUserAccount()
  const chainId = getChainId(chain)

  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: reliquaryAbi,
    address: config.contracts.beets?.reliquary,
    functionName: 'getLevelInfo',
    args: [BigInt(poolId || '0')],
    query: { enabled: isConnected && !shouldChangeNetwork && !!userAddress && !!poolId },
  })

  return {
    ...query,
    maturityThresholds: query.data?.requiredMaturities.map(maturity => maturity.toString()),
  }
}
