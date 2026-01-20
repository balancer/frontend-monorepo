import { getNetworkConfig, getChainId } from '@repo/lib/config/app.config'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { useReliquary } from '@/lib/modules/reliquary/ReliquaryProvider'

export function useGetLevelInfo(poolId: string | undefined) {
  const { chain } = useReliquary()
  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)
  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const { isConnected } = useUserAccount()

  const query = useReadContract({
    chainId,
    abi: reliquaryAbi,
    address: config.contracts.beets?.reliquary,
    functionName: 'getLevelInfo',
    args: poolId ? [BigInt(poolId)] : undefined,
    query: { enabled: isConnected && !shouldChangeNetwork && !!poolId },
  })

  return {
    ...query,
    maturityThresholds: query.data?.requiredMaturities.map(maturity => maturity.toString()),
  }
}
