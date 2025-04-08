import { useMemo, useCallback, useState } from 'react'
import { useUserAccount } from '../../../web3/UserAccountProvider'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { Address } from 'viem'
import { ManagedTransactionInput } from '../../../web3/contracts/useManagedTransaction'
import {
  LockActionType,
  getDescription,
  getConfirmingLabel,
  getConfirmedLabel,
  getInitLabel,
  getTooltip,
  parseDate,
  getLockContractFunctionName,
} from './lock-steps.utils'
import { useTransactionState } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'

type UseLockStepArgs = {
  lockAmount: bigint
  lockEndDate: string
  lockActionType: LockActionType
}

export function useLockStep({ lockAmount, lockEndDate, lockActionType }: UseLockStepArgs) {
  const { userAddress } = useUserAccount()
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
          // FIXME: (votes) This should be amount to increase but we are passing current amount + amount to increase
          return [lockAmount]
        default:
          return []
      }
    }

    return {
      enabled: !!lockAmount && !!lockEndDate,
      labels,
      chainId: mainnetNetworkConfig.chainId,
      contractAddress: mainnetNetworkConfig.contracts.veBAL as Address,
      contractId: 'balancer.veBAL',
      functionName: getLockContractFunctionName(lockActionType),
      args: getArgs() as any,
      txSimulationMeta,
    }
  }, [lockAmount, lockEndDate, lockActionType, labels, txSimulationMeta])

  const onSuccess = useCallback(() => {
    // Handle success actions
  }, [])

  const { getTransaction } = useTransactionState()

  const transaction = getTransaction(lockActionType)

  const [isStepActivated, setIsStepActivated] = useState(false)

  const lockStep: TransactionStep = useMemo(
    () => ({
      isStepActivated,
      id: lockActionType,
      stepType: lockActionType,
      labels,
      isComplete: () => transaction?.result.isSuccess || false,
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
