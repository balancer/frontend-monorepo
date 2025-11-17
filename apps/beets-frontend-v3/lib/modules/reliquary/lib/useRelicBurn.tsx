import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getChainId } from '@repo/lib/config/app.config'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { useManagedTransaction } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReliquary } from '../ReliquaryProvider'

export function useRelicBurn() {
  const { isConnected } = useUserAccount()
  const { selectedRelic } = useReliquary()
  const relicId = selectedRelic?.relicId

  const labels = {
    init: 'Burn relic',
    title: 'Burn relic',
    confirming: 'Confirming burn...',
    confirmed: 'Relic burned!',
    tooltip: 'Burn relic',
  }

  const transaction = useManagedTransaction({
    labels,
    chainId: getChainId(GqlChain.Sonic),
    contractId: 'beets.reliquary',
    contractAddress: getNetworkConfig(GqlChain.Sonic).contracts.beets?.reliquary || '',
    functionName: 'burn',
    args: relicId ? [BigInt(relicId)] : null,
    enabled: isConnected && !!relicId,
    onTransactionChange: () => {},
  })

  return {
    burn: transaction.executeAsync,
    isPending: transaction.simulation.isPending,
    isSubmitting: transaction.execution.isPending,
    submitError: transaction.execution.error,
  }
}
