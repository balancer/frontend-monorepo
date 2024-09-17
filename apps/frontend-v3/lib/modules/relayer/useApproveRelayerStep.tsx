import { SupportedChainId } from '@/lib/config/config.types'
import { TransactionLabels, TransactionStep } from '../transactions/transaction-steps/lib'
import { ManagedTransactionButton } from '../transactions/transaction-steps/TransactionButton'
import { ManagedTransactionInput } from '../web3/contracts/useManagedTransaction'
import { useUserAccount } from '../web3/UserAccountProvider'
import { getNetworkConfig } from '@/lib/config/app.config'
import { useHasApprovedRelayer } from './useHasApprovedRelayer'
import { sentryMetaForWagmiSimulation } from '@/lib/shared/utils/query-errors'
import { useMemo } from 'react'

const approveRelayerStepId = 'approve-relayer'

export function useApproveRelayerStep(chainId: SupportedChainId): {
  isLoading: boolean
  step: TransactionStep
} {
  const { userAddress, isConnected } = useUserAccount()
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
  }

  const step = useMemo(
    (): TransactionStep => ({
      id: approveRelayerStepId,
      stepType: 'approveBatchRelayer',
      labels,
      isComplete: () => isConnected && hasApprovedRelayer,
      renderAction: () => <ManagedTransactionButton id={approveRelayerStepId} {...props} />,
      onSuccess: () => refetch(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasApprovedRelayer, isConnected, isLoading]
  )

  return {
    isLoading,
    step,
  }
}
