import networkConfig from '../../../../config/networks/mainnet'
import { useMemo } from 'react'
import { Address } from 'viem'
import { sentryMetaForWagmiSimulation } from '../../../../shared/utils/query-errors'
import { claimableVeBalRewardsTokens } from '../../../portfolio/PortfolioClaim/useProtocolRewards'
import { TransactionLabels, TransactionStep } from '../../../transactions/transaction-steps/lib'
import { ManagedTransactionButton } from '../../../transactions/transaction-steps/TransactionButton'
import { useTransactionState } from '../../../transactions/transaction-steps/TransactionStateProvider'
import { ManagedTransactionInput } from '../../../web3/contracts/useManagedTransaction'
import { useUserAccount } from '../../../web3/UserAccountProvider'

const labels: TransactionLabels = {
  init: 'Claim',
  title: 'Claim',
  description: 'Claim all protocol revenue.',
  confirming: 'Confirming claim...',
  confirmed: 'Claimed!',
  tooltip: 'Claim all protocol revenue',
}

export const claimVeBalRewardsStepId = 'claim-vebal-rewards'

export function useClaimVeBalRewardsStep({
  onSuccess,
}: {
  onSuccess: () => void
}): TransactionStep {
  const { userAddress } = useUserAccount()
  const { getTransaction } = useTransactionState()

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (Claim veBal rewards transaction)',
    {
      userAddress,
      feeDistributor: networkConfig.contracts.feeDistributor,
    },
  )

  const props: ManagedTransactionInput = {
    labels,
    chainId: 1, // only on mainnet
    contractAddress: networkConfig.contracts.feeDistributor as string,
    contractId: 'balancer.feeDistributor',
    functionName: 'claimTokens',
    args: [userAddress, claimableVeBalRewardsTokens as Address[]],
    enabled: !!userAddress,
    txSimulationMeta,
  }

  const transaction = getTransaction(claimVeBalRewardsStepId)

  const isComplete = () => userAddress && !!transaction?.result.isSuccess

  return useMemo(
    () => ({
      id: claimVeBalRewardsStepId,
      stepType: 'claim',
      labels,
      isComplete,
      onSuccess,
      renderAction: () => <ManagedTransactionButton id={claimVeBalRewardsStepId} {...props} />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transaction, userAddress],
  )
}