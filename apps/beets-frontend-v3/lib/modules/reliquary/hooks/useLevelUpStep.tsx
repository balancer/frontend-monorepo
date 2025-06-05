'use client'

import { getChainId } from '@repo/lib/config/app.config'
import networkConfigs from '@repo/lib/config/networks'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
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
import { useGetRelicPositionsOfOwner } from '@/lib/modules/reliquary/hooks/useGetRelicPositionsOfOwner'

export function useLevelUpStep(chain: GqlChain, relicId: string | undefined) {
  const { isConnected } = useUserAccount()
  const { refetch } = useGetRelicPositionsOfOwner(chain)
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const labels: TransactionLabels = {
    init: 'Level up',
    title: 'Level up',
    confirming: 'Confirming level up...',
    confirmed: 'Level up!',
    tooltip: 'tooltip',
  }

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (Level up transaction)',
    {}
  )

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(chain),
    contractId: 'beets.reliquary',
    contractAddress: networkConfigs[chain].contracts.beets?.reliquary || '',
    functionName: 'updatePosition',
    args: relicId ? [relicId] : null,
    enabled: isConnected && !!relicId,
    txSimulationMeta,
    onTransactionChange: setTransaction,
  }

  const isComplete = () => isConnected && isTransactionSuccess(transaction)

  const step: TransactionStep = {
    id: 'levelUp',
    labels,
    stepType: 'levelUp',
    isComplete,
    onSuccess: () => refetch(),
    renderAction: () => <ManagedTransactionButton id="levelUp" {...props} />,
  }

  return { step }
}
