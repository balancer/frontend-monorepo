'use client'

import { getNetworkConfig } from '@repo/lib/config/app.config'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useState } from 'react'
import { useReliquary } from '../ReliquaryProvider'

export function useLevelUpStep(relicId: string | undefined) {
  const { isConnected, chainId } = useUserAccount()
  const { refetchRelicPositions } = useReliquary()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const labels: TransactionLabels = {
    init: 'Level up',
    title: 'Level up',
    confirming: 'Confirming level up...',
    confirmed: 'Level up!',
    tooltip: 'Upgrade your relic to the next maturity level',
  }

  const props: ManagedTransactionInput = {
    labels,
    chainId: chainId!,
    contractId: 'beets.reliquary',
    contractAddress: getNetworkConfig(chainId!).contracts.beets?.reliquary || '',
    functionName: 'updatePosition',
    args: relicId ? [relicId] : null,
    enabled: isConnected && !!relicId,
    onTransactionChange: setTransaction,
  }

  const isComplete = () => isConnected && isTransactionSuccess(transaction)

  const step: TransactionStep = {
    id: 'levelUp',
    labels,
    stepType: 'levelUp',
    isComplete,
    onSuccess: () => refetchRelicPositions(),
    renderAction: () => <ManagedTransactionButton id="levelUp" {...props} />,
    transaction,
  }

  return { step }
}
