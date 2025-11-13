import networkConfig from '@repo/lib/config/networks/mainnet'
import { claimableVeBalRewardsTokens } from '@repo/lib/modules/portfolio/PortfolioClaim/useProtocolRewards'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useCallback, useMemo, useState } from 'react'
import { Address } from 'viem'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'

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
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const txSimulationMeta = useMemo(
    () =>
      sentryMetaForWagmiSimulation(
        'Error in wagmi tx simulation (Claim veBal rewards transaction)',
        {
          userAddress,
          feeDistributor: networkConfig.contracts.feeDistributor,
        }
      ),
    [userAddress]
  )

  const buttonProps: ManagedTransactionInput = useMemo(
    () => ({
      labels,
      chainId: 1, // only on mainnet
      contractAddress: networkConfig.contracts.feeDistributor as string,
      contractId: 'balancer.feeDistributor',
      functionName: 'claimTokens',
      args: [userAddress, claimableVeBalRewardsTokens as Address[]],
      enabled: !!userAddress,
      txSimulationMeta,
      onTransactionChange: setTransaction,
    }),
    [txSimulationMeta, userAddress]
  )

  const isComplete = useCallback(
    () => userAddress && isTransactionSuccess(transaction),
    [transaction, userAddress]
  )

  return useMemo(
    () => ({
      id: claimVeBalRewardsStepId,
      stepType: 'claim',
      labels,
      transaction,
      isComplete,
      onSuccess,
      renderAction: () => (
        <ManagedTransactionButton id={claimVeBalRewardsStepId} {...buttonProps} />
      ),
    }),

    [buttonProps, isComplete, onSuccess, transaction]
  )
}
