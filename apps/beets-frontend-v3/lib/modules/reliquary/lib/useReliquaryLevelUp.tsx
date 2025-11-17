import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getChainId } from '@repo/lib/config/app.config'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { useManagedTransaction } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReliquary } from '../ReliquaryProvider'

export function useReliquaryLevelUp() {
  const { isConnected } = useUserAccount()
  const { selectedRelic } = useReliquary()
  const relicId = selectedRelic?.relicId

  const labels = {
    init: 'Level up',
    title: 'Level up',
    confirming: 'Confirming level up...',
    confirmed: 'Level up!',
    tooltip: 'Level up relic',
  }

  const transaction = useManagedTransaction({
    labels,
    chainId: getChainId(GqlChain.Sonic),
    contractId: 'beets.reliquary',
    contractAddress: getNetworkConfig(GqlChain.Sonic).contracts.beets?.reliquary || '',
    functionName: 'updatePosition',
    args: relicId ? [relicId] : null,
    enabled: isConnected && !!relicId,
    onTransactionChange: () => {},
  })

  return {
    levelUp: transaction.executeAsync,
    isPending: transaction.simulation.isPending,
    isSubmitting: transaction.execution.isPending,
    submitError: transaction.execution.error,
  }
}
