import { SupportedChainId } from '@repo/lib/config/config.types'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '../transactions/transaction-steps/lib'
import { ManagedTransactionButton } from '../transactions/transaction-steps/TransactionButton'
import { ManagedTransactionInput } from '../web3/contracts/useManagedTransaction'
import { useUserAccount } from '../web3/UserAccountProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { useHasApprovedRelayer } from './useHasApprovedRelayer'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useState } from 'react'

const approveRelayerStepId = 'approve-relayer'

export function useApproveRelayerStep(chainId: SupportedChainId): {
  isLoading: boolean
  step: TransactionStep
} {
  const { userAddress, isConnected } = useUserAccount()
  const [, setTransaction] = useState<ManagedResult | undefined>()

  const config = getNetworkConfig(chainId)

  const relayerAddress = config.contracts.balancer.relayerV6
  const vaultAddress = config.contracts.balancer.vaultV2

  const { hasApprovedRelayer, isLoading, refetch } = useHasApprovedRelayer(chainId)

  const labels: TransactionLabels = {
    title: 'Approve relayer',
    description: 'Approve the Balancer relayer.',
    init: 'Approve relayer',
    confirming: 'Confirming approval...',
    confirmed: 'Relayer approved!',
    tooltip: 'Approve the Balancer relayer.',
  }

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation: Approving Relayer',
    {
      vaultAddress,
      userAddress,
      relayerAddress,
      chainId,
    }
  )

  const props: ManagedTransactionInput = {
    contractAddress: vaultAddress,
    contractId: 'balancer.vaultV2',
    functionName: 'setRelayerApproval',
    labels,
    chainId,
    args: [userAddress, relayerAddress, true],
    enabled: !!userAddress && !isLoading,
    txSimulationMeta,
    onTransactionChange: setTransaction,
  }

  const step: TransactionStep = {
    id: approveRelayerStepId,
    stepType: 'approveBatchRelayer',
    labels,
    isComplete: () => isConnected && hasApprovedRelayer,
    renderAction: () => <ManagedTransactionButton id={approveRelayerStepId} {...props} />,
    onSuccess: () => refetch(),
  }

  return {
    isLoading,
    step,
  }
}
