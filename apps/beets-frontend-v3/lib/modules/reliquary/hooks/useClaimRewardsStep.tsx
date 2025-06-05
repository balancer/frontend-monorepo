'use client'

import { getChainId } from '@repo/lib/config/app.config'
import networkConfigs from '@repo/lib/config/networks'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useState } from 'react'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'

export function useClaimRewardsStep(chain: GqlChain, relicId: string | undefined) {
  const { isConnected, userAddress } = useUserAccount()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const labels: TransactionLabels = {
    init: 'Claim incentives',
    title: 'Claim incentives',
    confirming: 'Confirming incentives claim...',
    confirmed: 'Incentives claimed!',
    tooltip: 'tooltip',
  }

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (Claim relic incentives transaction)',
    {}
  )

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(chain),
    contractId: 'beets.reliquary',
    contractAddress: networkConfigs[chain].contracts.beets?.reliquary as string,
    functionName: 'harvest',
    args: relicId && userAddress ? [BigInt(relicId), userAddress] : null,
    enabled: isConnected && !!relicId && !!userAddress,
    txSimulationMeta,
    onTransactionChange: setTransaction,
  }

  const isComplete = () => isConnected && isTransactionSuccess(transaction)

  const step: TransactionStep = {
    id: 'claimRelicReward',
    labels,
    stepType: 'claimRelicReward',
    isComplete,
    renderAction: () => <ManagedTransactionButton id="claimRelicReward" {...props} />,
  }

  return { step }
}
