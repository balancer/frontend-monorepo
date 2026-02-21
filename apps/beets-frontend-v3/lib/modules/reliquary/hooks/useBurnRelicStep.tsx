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
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useBurnRelicStep(relicId: string | undefined, chain: GqlChain) {
  const { isConnected } = useUserAccount()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const chainId = getChainId(chain)

  const labels: TransactionLabels = {
    init: 'Burn maBEETS position',
    title: 'Burn maBEETS position',
    confirming: 'Confirming burn...',
    confirmed: 'maBEETS position burned!',
    tooltip: 'Burn this maBEETS position to remove all liquidity',
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
    onSuccess: () => {},
    renderAction: () => <ManagedTransactionButton id="burnRelic" {...props} />,
    transaction,
  }

  return { step }
}
