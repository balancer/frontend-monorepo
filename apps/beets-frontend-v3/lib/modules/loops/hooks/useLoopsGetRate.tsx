import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { loopedSonicVaultAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'

export function useLoopsGetRate(chain: GqlChain) {
  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: loopedSonicVaultAbi,
    address: config.contracts.beets?.loopedSonicVault,
    functionName: 'getRate',
    args: [],
    query: { enabled: true },
  })

  return {
    ...query,
    rate: query.data ?? 10n ** 18n,
  }
}
