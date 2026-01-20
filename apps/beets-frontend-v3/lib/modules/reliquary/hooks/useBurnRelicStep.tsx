'use client'

import { getNetworkConfig, getChainId } from '@repo/lib/config/app.config'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useState } from 'react'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useGetRelicPositionsOfOwner } from '@/lib/modules/reliquary/hooks/useGetRelicPositionsOfOwner'
import { useReliquary } from '../ReliquaryProvider'

export function useBurnRelicStep(relicId: string | undefined) {
  const { isConnected } = useUserAccount()
  const { refetch } = useGetRelicPositionsOfOwner()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const { chain } = useReliquary()

  const chainId = getChainId(chain)

  const labels: TransactionLabels = {
    init: 'Burn Relic',
    title: 'Burn Relic',
    confirming: 'Confirming burn...',
    confirmed: 'Relic burned!',
    tooltip: 'Burn this Relic to withdraw all funds',
  }

  const props: ManagedTransactionInput = {
    labels,
    chainId,
    contractId: 'beets.reliquary',
    contractAddress: getNetworkConfig(chainId).contracts.beets?.reliquary || '',
    functionName: 'burn',
    args: relicId ? [BigInt(relicId)] : null,
    enabled: isConnected && !!relicId,
    onTransactionChange: setTransaction,
  }

  const isComplete = () => isConnected && isTransactionSuccess(transaction)

  const step: TransactionStep = {
    id: 'burnRelic',
    labels,
    stepType: 'burnRelic',
    isComplete,
    onSuccess: () => refetch(),
    renderAction: () => <ManagedTransactionButton id="burnRelic" {...props} />,
    transaction,
  }

  return { step }
}
