import { usePortfolio } from '@repo/lib/modules/portfolio/PortfolioProvider'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useMemo, useState } from 'react'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'

const labels: TransactionLabels = {
  init: 'Claim',
  title: 'Claim',
  description: 'Claim Hidden Hand rewards.',
  confirming: 'Confirming claim...',
  confirmed: 'Claimed!',
  tooltip: 'Claim Hidden Hand rewards',
}

export const claimHiddenHandRewardsStepId = 'claim-hidden-hand-rewards'

export function useClaimHiddenHandRewardsStep({
  onSuccess,
}: {
  onSuccess: () => void
}): TransactionStep {
  const { userAddress } = useUserAccount()
  const { hiddenHandRewardsData } = usePortfolio()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const networkConfig = getNetworkConfig(PROJECT_CONFIG.defaultNetwork)

  const rewards = hiddenHandRewardsData?.data || []

  const claimArgs =
    rewards && rewards.length > 0
      ? rewards.map(reward => ({
          identifier: reward.claimMetadata.identifier,
          account: reward.claimMetadata.account,
          amount: reward.claimMetadata.amount,
          merkleProof: reward.claimMetadata.merkleProof,
        }))
      : []

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (Claim Hidden Hand rewards transaction)',
    {
      userAddress,
      rewardDistributor: networkConfig.contracts.rewardDistributor,
      claimArgs,
    }
  )

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(PROJECT_CONFIG.defaultNetwork),
    contractAddress: networkConfig.contracts.rewardDistributor || '',
    contractId: 'balancer.rewardDistributor',
    functionName: 'claim',
    args: [claimArgs] as any,
    enabled:
      !!userAddress &&
      !!rewards &&
      rewards.length > 0 &&
      !!networkConfig.contracts.rewardDistributor,
    txSimulationMeta,
    onTransactionChange: setTransaction,
  }

  return useMemo(
    () => ({
      id: claimHiddenHandRewardsStepId,
      stepType: 'claim',
      labels,
      transaction,
      isComplete: () => userAddress && isTransactionSuccess(transaction),
      onSuccess,
      renderAction: () => <ManagedTransactionButton id={claimHiddenHandRewardsStepId} {...props} />,
    }),

    [props, onSuccess, transaction, userAddress, rewards]
  )
}
