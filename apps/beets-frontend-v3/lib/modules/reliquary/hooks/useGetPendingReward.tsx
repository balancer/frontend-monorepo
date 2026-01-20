import { getNetworkConfig, getChainId } from '@repo/lib/config/app.config'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { bn } from '@repo/lib/shared/utils/numbers'
import { formatUnits } from 'viem'
import { useReliquary } from '@/lib/modules/reliquary/ReliquaryProvider'

export function useGetPendingReward(relicId: string | undefined) {
  const { chain } = useReliquary()
  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)
  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const { isConnected } = useUserAccount()
  const { priceFor } = useTokens()

  const query = useReadContract({
    chainId,
    abi: reliquaryAbi,
    address: config.contracts.beets?.reliquary,
    functionName: 'pendingReward',
    args: relicId ? [BigInt(relicId)] : undefined,
    query: { enabled: isConnected && !shouldChangeNetwork && !!relicId },
  })

  return {
    ...query,
    amount: query.data,
    usdValue: query.data
      ? bn(formatUnits(query.data, 18)).times(
          priceFor(config.tokens.addresses.beets!, config.chain)
        )
      : bn(0),
  }
}
