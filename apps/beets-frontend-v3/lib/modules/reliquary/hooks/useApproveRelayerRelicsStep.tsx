import { getNetworkConfig, getChainId } from '@repo/lib/config/app.config'
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
import { useReliquary } from '../ReliquaryProvider'

const approveRelayerRelicsStepId = 'approve-relayer-for-relics'

export function useApproveRelayerRelicsStep(): {
  isLoading: boolean
  step: TransactionStep
} {
  const { userAddress, isConnected } = useUserAccount()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const { chain } = useReliquary()

  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)

  const relayerAddress = config.contracts.balancer.relayerV6
  const reliquaryAddress = config.contracts.beets?.reliquary

  const { hasApprovedRelayerForAllRelics, isLoading, refetch } = useHasApprovedRelayerForAllRelics()

  const labels: TransactionLabels = {
    title: 'Approve relayer for all maBEETS positions',
    description: 'Approve the relayer for all maBEETS positions.',
    init: 'Approve relayer for all maBEETS positions',
    confirming: 'Confirming approval...',
    confirmed: 'Relayer approved!',
    tooltip: 'Approve the relayer for all maBEETS positions.',
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
    transaction,
  }

  return {
    isLoading,
    step,
  }
}
