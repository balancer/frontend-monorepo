import { useMemo, useCallback } from 'react'
import { useTokenApprovalSteps } from '../../tokens/approvals/useTokenApprovalSteps'
import { useUserAccount } from '../../web3/UserAccountProvider'
import mainnetNetworkConfig from '@/lib/config/networks/mainnet'
import { RawAmount } from '../../tokens/approvals/approval-rules'
import { ManagedTransactionButton } from '@/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  TransactionLabels,
  TransactionStep,
} from '@/lib/modules/transactions/transaction-steps/lib'
import { sentryMetaForWagmiSimulation } from '@/lib/shared/utils/query-errors'
import { parseUnits } from 'viem'
import { ManagedTransactionInput } from '../../web3/contracts/useManagedTransaction'
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

type UseCreateLockArgs = {
  lockAmount: RawAmount
  lockEndDate: string
  lockActionType: LockActionType
}

export function useLockSteps({ lockAmount, lockEndDate, lockActionType }: UseCreateLockArgs) {
  const { userAddress } = useUserAccount()
  const amount = lockAmount.rawAmount.toString()
  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: mainnetNetworkConfig.contracts.veBAL,
      chain: mainnetNetworkConfig.chain,
      approvalAmounts: [lockAmount],
      actionType: 'Locking',
    })

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
          return [parseUnits(amount, 18), parseDate(lockEndDate)]
        case LockActionType.ExtendLock:
          return [parseDate(lockEndDate)]
        case LockActionType.IncreaseLock:
          return [parseUnits(amount, 18)]
        default:
          return []
      }
    }

    return {
      enabled: !!lockAmount.rawAmount && !!lockEndDate,
      labels,
      chainId: mainnetNetworkConfig.chainId,
      contractId: 'balancer.veBAL',
      contractAddress: mainnetNetworkConfig.contracts.veBAL,
      functionName: getLockContractFunctionName(lockActionType),
      args: getArgs() as any,
      txSimulationMeta,
    }
  }, [lockAmount, lockEndDate, lockActionType, labels, txSimulationMeta, amount])

  const onSuccess = useCallback(() => {
    // Handle success actions
  }, [])

  const lockStep: TransactionStep = useMemo(
    () => ({
      id: lockActionType,
      stepType: lockActionType,
      labels,
      contractId: 'veBAL',
      contractAddress: mainnetNetworkConfig.contracts.veBAL,
      isComplete: () => false,
      // onActivated: () => {},
      // onDeactivated: () => {},
      onSuccess,
      renderAction: () => <ManagedTransactionButton id={lockActionType.toString()} {...props} />,
    }),
    [labels, onSuccess, props, lockActionType]
  )

  const steps = [lockStep, ...tokenApprovalSteps]

  return {
    isLoadingSteps: isLoadingTokenApprovalSteps,
    steps,
  }
}
