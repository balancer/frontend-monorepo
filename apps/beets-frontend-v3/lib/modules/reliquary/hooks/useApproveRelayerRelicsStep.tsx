import { SupportedChainId } from '@repo/lib/config/config.types'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { useHasApprovedRelayerForAllRelics } from './useHasApprovedRelayerForAllRelics'
import { useState } from 'react'
import {
  TransactionStep,
  TransactionLabels,
  ManagedResult,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'

const approveRelayerRelicsStepId = 'approve-relayer-for-relics'

export function useApproveRelayerRelicsStep(chainId: SupportedChainId): {
  isLoading: boolean
  step: TransactionStep
} {
  const { userAddress, isConnected } = useUserAccount()
  const [, setTransaction] = useState<ManagedResult | undefined>()

  const config = getNetworkConfig(chainId)

  const relayerAddress = config.contracts.balancer.relayerV6
  const reliquaryAddress = config.contracts.beets?.reliquary

  const { hasApprovedRelayerForAllRelics, isLoading, refetch } =
    useHasApprovedRelayerForAllRelics(chainId)

  const labels: TransactionLabels = {
    title: 'Approve relayer for all relics',
    description: 'Approve the relayer for all relics.',
    init: 'Approve relayer for all relics',
    confirming: 'Confirming approval...',
    confirmed: 'Relayer approved!',
    tooltip: 'Approve the relayer for all relics.',
  }

  const props: ManagedTransactionInput = {
    contractAddress: reliquaryAddress || '0x',
    contractId: 'beets.reliquary',
    functionName: 'setApprovalForAll',
    labels,
    chainId,
    args: [relayerAddress, true],
    enabled: !!userAddress && !isLoading,
    onTransactionChange: setTransaction,
  }

  const step: TransactionStep = {
    id: approveRelayerRelicsStepId,
    stepType: 'approveBatchRelayerForAllRelics',
    labels,
    isComplete: () => isConnected && hasApprovedRelayerForAllRelics,
    renderAction: () => <ManagedTransactionButton id={approveRelayerRelicsStepId} {...props} />,
    onSuccess: () => refetch(),
  }

  return {
    isLoading,
    step,
  }
}
