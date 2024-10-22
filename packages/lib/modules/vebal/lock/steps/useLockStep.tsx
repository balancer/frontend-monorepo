import { useMemo, useCallback, useState } from 'react'
import { useUserAccount } from '../../../web3/UserAccountProvider'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { RawAmount } from '../../../tokens/approvals/approval-rules'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { Hex, parseUnits } from 'viem'
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
} from './lock.helpers'
import { useTransactionState } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { bn } from '@repo/lib/shared/utils/numbers'

type UseLockStepArgs = {
  lockAmount: RawAmount
  lockEndDate: string
  lockActionType: LockActionType
}

export function useLockStep({ lockAmount, lockEndDate, lockActionType }: UseLockStepArgs) {
  const { userAddress } = useUserAccount()
  const amount = lockAmount.rawAmount.toString()

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
    'Error in wagmi tx simulation (Lock transaction)',
    {
      userAddress,
      lockAmount: lockAmount.rawAmount.toString(),
      lockEndDate,
      lockActionType,
    }
  )

  const props: ManagedTransactionInput = useMemo(() => {
    function getArgs() {
      switch (lockActionType) {
        case LockActionType.CreateLock:
          return [bn(amount), parseDate(lockEndDate)]
        case LockActionType.ExtendLock:
          return [parseDate(lockEndDate)]
        case LockActionType.IncreaseLock:
          return [bn(amount)]
        default:
          return []
      }
    }

    return {
      enabled: !!lockAmount.rawAmount && !!lockEndDate,
      labels,
      chainId: mainnetNetworkConfig.chainId,
      contractId: 'balancer.veBAL',
      contractAddress: mainnetNetworkConfig.contracts.veBAL as Hex,
      functionName: getLockContractFunctionName(lockActionType),
      args: getArgs() as any,
      txSimulationMeta,
    }
  }, [lockAmount, lockEndDate, lockActionType, labels, txSimulationMeta, amount])

  const onSuccess = useCallback(() => {
    // Handle success actions
  }, [])

  const { getTransaction } = useTransactionState()

  const transaction = getTransaction(lockActionType)

  const isComplete = () => transaction?.result.isSuccess || false

  const [isStepActivated, setIsStepActivated] = useState(false)

  const lockStep: TransactionStep = useMemo(
    () => ({
      id: lockActionType,
      stepType: lockActionType,
      labels,
      isComplete,
      onSuccess,
      onActivated: () => setIsStepActivated(true),
      onDeactivated: () => setIsStepActivated(false),
      renderAction: () => <ManagedTransactionButton id={lockActionType.toString()} {...props} />,
    }),
    [lockActionType, labels, isComplete, onSuccess, props]
  )

  return lockStep
}
