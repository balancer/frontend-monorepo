import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getChainId } from '@repo/lib/config/app.config'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { useManagedTransaction } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'

export function useRelicHarvestRewards(relicId: string, onSuccess?: () => void) {
  const { isConnected, userAddress } = useUserAccount()

  const labels = {
    init: 'Claim rewards',
    title: 'Claim rewards',
    confirming: 'Confirming rewards claim...',
    confirmed: 'Rewards claimed!',
    tooltip: 'Claim your pending BEETS rewards',
  }

  const transaction = useManagedTransaction({
    labels,
    chainId: getChainId(GqlChain.Sonic),
    contractId: 'beets.reliquary',
    contractAddress: getNetworkConfig(GqlChain.Sonic).contracts.beets?.reliquary as string,
    functionName: 'harvest',
    args: relicId && userAddress ? [BigInt(relicId), userAddress] : null,
    enabled: isConnected && !!relicId && !!userAddress,
    onTransactionChange: tx => {
      if (tx.result.isSuccess) {
        onSuccess?.()
      }
    },
  })

  return {
    harvest: transaction.executeAsync,
    isPending: transaction.simulation.isPending,
    isSubmitting: transaction.execution.isPending,
    submitError: transaction.execution.error,
  }
}
