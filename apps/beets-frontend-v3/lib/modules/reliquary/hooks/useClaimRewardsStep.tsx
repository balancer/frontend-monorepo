'use client'

import { getChainId } from '@repo/lib/config/app.config'
import networkConfigs from '@repo/lib/config/networks'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { useTransactionState } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import {
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useMemo } from 'react'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { noop } from 'lodash'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useGetPendingReward } from './useGetPendingReward'

export function useClaimRewardsStep(chain: GqlChain, relicId: string | undefined) {
  const { getTransaction } = useTransactionState()
  const { isConnected, userAddress } = useUserAccount()
  const { refetch } = useGetPendingReward(chain, relicId)

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
    args: [relicId || ''],
    enabled: isConnected && !!relicId && !!userAddress,
    txSimulationMeta,
  }

  const transaction = getTransaction('claimRelicReward')

  const isComplete = () => isConnected && !!transaction?.result.isSuccess

  const step = useMemo(
    (): TransactionStep => ({
      id: 'claimRelicReward',
      labels,
      stepType: 'claimRelicReward',
      isComplete,
      onActivated: noop,
      onDeactivated: noop,
      onSuccess: () => refetch(),
      renderAction: () => <ManagedTransactionButton id="claimRelicReward" {...props} />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transaction]
  )
  return { step }
}
