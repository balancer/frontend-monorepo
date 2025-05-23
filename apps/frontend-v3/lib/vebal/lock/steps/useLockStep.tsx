import { useMemo, useCallback, useState } from 'react'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { Address } from 'viem'
import {
  getDescription,
  getConfirmingLabel,
  getConfirmedLabel,
  getInitLabel,
  getTooltip,
  parseDate,
  getLockContractFunctionName,
} from './lock-steps.utils'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { LockActionType } from '@repo/lib/modules/vebal/vote/vote.types'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'

type UseLockStepArgs = {
  lockAmount: bigint
  lockEndDate: string
  lockActionType: LockActionType
}

export function useLockStep({ lockAmount, lockEndDate, lockActionType }: UseLockStepArgs) {
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const { userAddress } = useUserAccount()
  const { refetchBalances } = useTokenBalances()
  const labels: TransactionLabels = useMemo(
    () => ({
      init: getInitLabel(lockActionType),
      title: getInitLabel(lockActionType),
      description: getDescription(lockActionType),
      confirming: getConfirmingLabel(lockActionType),
      confirmed: getConfirmedLabel(lockActionType, lockAmount, lockEndDate),
      tooltip: getTooltip(lockActionType),
    }),
    [lockActionType, lockAmount, lockEndDate]
  )

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    `Error in wagmi tx simulation (Lock transaction of type ${lockActionType})`,
    {
      userAddress,
      lockAmount: lockAmount.toString(),
      lockEndDate,
      lockActionType,
    }
  )

  const props: ManagedTransactionInput = useMemo(() => {
    function getArgs() {
      switch (lockActionType) {
        case LockActionType.CreateLock:
          return [lockAmount, parseDate(lockEndDate)]
        case LockActionType.ExtendLock:
          return [parseDate(lockEndDate)]
        case LockActionType.IncreaseLock:
          return [lockAmount]
        default:
          return []
      }
    }

    return {
      enabled: !!lockEndDate,
      labels,
      chainId: mainnetNetworkConfig.chainId,
      contractAddress: mainnetNetworkConfig.contracts.veBAL as Address,
      contractId: 'balancer.veBAL',
      functionName: getLockContractFunctionName(lockActionType),
      args: getArgs() as any,
      txSimulationMeta,
      onTransactionChange: setTransaction,
    }
  }, [lockAmount, lockEndDate, lockActionType, labels, txSimulationMeta])

  const onSuccess = useCallback(async () => {
    // Refetches veBAL BPT balance which also affects veBal balance queries
    await refetchBalances()
  }, [refetchBalances])

  const [isStepActivated, setIsStepActivated] = useState(false)

  const lockStep: TransactionStep = useMemo(
    () => ({
      isStepActivated,
      id: lockActionType,
      stepType: lockActionType,
      labels,
      isComplete: () => isTransactionSuccess(transaction),
      onSuccess,
      onActivated: () => setIsStepActivated(true),
      onDeactivated: () => setIsStepActivated(false),
      renderAction: () => <ManagedTransactionButton id={lockActionType.toString()} {...props} />,
      // only used for integration testing
      _txInput: props,
    }),
    [lockActionType, labels, onSuccess, props, transaction, isStepActivated]
  )

  return lockStep
}
