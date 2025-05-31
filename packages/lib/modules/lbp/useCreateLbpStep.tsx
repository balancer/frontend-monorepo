import { useMemo, useState } from 'react'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { useCreateLbpBuildCall } from './useCreateLbpBuildCall'
import { useTenderly } from '@repo/lib/modules/web3/useTenderly'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useLbpForm } from './LbpFormProvider'
import { DisabledTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionStepButton'

export const createLbpStepId = 'create-lbp'

export function useCreateLbpStep(): TransactionStep {
  const { saleStructureForm } = useLbpForm()
  const saleStructure = saleStructureForm.getValues()

  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const [isStepActivated, setIsStepActivated] = useState(false)

  const chainId = getNetworkConfig(saleStructure.selectedChain).chainId

  const { buildTenderlyUrl } = useTenderly({ chainId })

  const labels: TransactionLabels = {
    init: 'Create LBP',
    title: 'Create LBP',
    description: 'Create a new Liquidity Bootstrapping Pool',
    confirming: 'Creating a new Liquidity Bootstrapping Pool',
    confirmed: 'Created a new Liquidity Bootstrapping Pool',
    tooltip: 'Create a new LBP',
  }

  const buildCallDataQuery = useCreateLbpBuildCall({ enabled: isStepActivated })

  const gasEstimationMeta = sentryMetaForWagmiSimulation('Error in create LBP gas estimation', {
    buildCallQueryData: buildCallDataQuery.data,
    tenderlyUrl: buildTenderlyUrl(buildCallDataQuery.data),
  })

  const isComplete = () => isTransactionSuccess(transaction)

  return useMemo(
    () => ({
      id: createLbpStepId,
      stepType: 'createLbp',
      labels,
      transaction,
      isComplete,
      onActivated: () => setIsStepActivated(true),
      onDeactivated: () => setIsStepActivated(false),
      // onSuccess,
      renderAction: () => {
        if (!buildCallDataQuery.data) return <DisabledTransactionButton />
        return (
          <ManagedSendTransactionButton
            gasEstimationMeta={gasEstimationMeta}
            id={createLbpStepId}
            labels={labels}
            txConfig={buildCallDataQuery.data}
            onTransactionChange={setTransaction}
          />
        )
      },
    }),
    /* eslint-disable react-hooks/exhaustive-deps */
    [transaction, labels, buildCallDataQuery.data]
  )
}
