import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useMemo } from 'react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { useState } from 'react'
import {
  ManagedResult,
  TransactionLabels,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { useApproveRelayerRelicsStep } from './useApproveRelayerRelicsStep'
import { reliquaryActionsService } from '@/lib/services/batch-relayer/extensions/reliquary-actions.service'
import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { useReliquary } from '@/lib/modules/reliquary/ReliquaryProvider'
import { Address } from 'viem'
import { TransactionBatchButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionBatchButton'
import { buildBatchableTxCall } from '@repo/lib/modules/transactions/transaction-steps/tx-batch.helpers'
import { useShouldBatchTransactions } from '@repo/lib/modules/transactions/transaction-steps/tx-batch.hooks'

const claimAllStepId = 'reliquary-claim-all-rewards'

export function useReliquaryClaimAllSteps() {
  const { pool } = usePool()
  const { userAddress } = useUserAccount()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const { relicIds } = useReliquary()

  const { contracts, chainId } = getNetworkConfig(pool.chain)
  const reliquaryRelayerMode = 'approveRelayer'

  const { step: approveRelayerStep, isLoading: isLoadingRelayerApproval } = useApproveRelayerStep(
    chainId,
    { relayerMode: reliquaryRelayerMode }
  )

  const { step: approveRelayerRelicsStep, isLoading: isLoadingRelayerRelicsApproval } =
    useApproveRelayerRelicsStep()

  const labels: TransactionLabels = {
    init: 'Claim all rewards',
    title: 'Claim all BEETS rewards',
    description: 'Claim pending BEETS rewards from all your maBEETS positions.',
    confirming: 'Claiming all rewards...',
    confirmed: 'All rewards claimed!',
    tooltip: 'Claim pending BEETS rewards from all your maBEETS positions',
    poolId: pool.id,
  }

  const harvestAllCalldata = useMemo(() => {
    if (!userAddress || relicIds.length === 0) return undefined

    return reliquaryActionsService.encodeHarvestAll({
      relicIds: relicIds.map(id => BigInt(id)),
      recipient: userAddress as Address,
    })
  }, [relicIds, userAddress])

  const props: ManagedTransactionInput = {
    enabled: !!userAddress && !!harvestAllCalldata,
    labels,
    chainId,
    contractId: 'balancer.relayerV6' as const,
    contractAddress: contracts.balancer.relayerV6,
    functionName: 'multicall' as const,
    args: [[harvestAllCalldata || '0x']],
    onTransactionChange: setTransaction,
  }

  const claimAllStep: TransactionStep = useMemo(
    () => ({
      id: claimAllStepId,
      stepType: 'claim',
      labels,
      details: {
        gasless: false,
        type: 'Gas transaction',
      },
      transaction,
      isComplete: () => isTransactionSuccess(transaction),
      renderAction: () => <ManagedTransactionButton id={claimAllStepId} {...props} />,
      renderBatchAction: (currentStep: TransactionStep) => (
        <TransactionBatchButton
          chainId={chainId}
          currentStep={currentStep}
          labels={labels}
          onTransactionChange={setTransaction}
        />
      ),
      // Last step in the batch: the multicall is preceded by the relayer approvals
      isBatchEnd: true,
      batchableTxCall: harvestAllCalldata
        ? buildBatchableTxCall('balancer.relayerV6', contracts.balancer.relayerV6, 'multicall', [
            [harvestAllCalldata],
          ])
        : undefined,
    }),
    [transaction, labels, isTransactionSuccess, props, harvestAllCalldata, chainId, contracts]
  )

  const shouldBatchTransactions = useShouldBatchTransactions()

  const steps = useMemo(
    () =>
      getReliquaryClaimAllSteps({
        shouldBatchTransactions,
        claimAllStep,
        approveRelayerRelicsStep,
        approveRelayerStep,
      }),
    [shouldBatchTransactions, claimAllStep, approveRelayerRelicsStep, approveRelayerStep]
  )

  return {
    isLoadingSteps: isLoadingRelayerApproval || isLoadingRelayerRelicsApproval,
    steps,
  }
}

/*
  Composes the reliquary claim-all step list. When batching, the relayer approvals
  (relayer + relayer-for-relics) are appended to the nested steps of the claim
  multicall so the whole flow runs as one atomic batch; otherwise they are shown
  as separate steps ahead of the multicall.
*/
export function getReliquaryClaimAllSteps({
  shouldBatchTransactions,
  claimAllStep,
  approveRelayerRelicsStep,
  approveRelayerStep,
}: {
  shouldBatchTransactions: boolean
  claimAllStep: TransactionStep
  approveRelayerRelicsStep: TransactionStep
  approveRelayerStep: TransactionStep
}): TransactionStep[] {
  if (shouldBatchTransactions) {
    // setRelayerApproval runs first, then setApprovalForAll, then the claim multicall
    claimAllStep.nestedSteps = [approveRelayerStep, approveRelayerRelicsStep]
    return [claimAllStep]
  }

  return [approveRelayerStep, approveRelayerRelicsStep, claimAllStep]
}
