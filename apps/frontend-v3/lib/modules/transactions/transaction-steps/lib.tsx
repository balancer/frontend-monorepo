import { TransactionBundle } from '@/lib/modules/web3/contracts/contract.types'
import { ReactNode } from 'react'
import { LockActionType } from '../../vebal/lock/lock.helpers'

export enum TransactionState {
  Ready = 'init',
  Confirming = 'confirming',
  Loading = 'loading',
  Preparing = 'preparing',
  Error = 'error',
  Completed = 'completed',
}

export type TransactionLabels = {
  title?: string
  description?: string
  tooltip: string
  // State labels
  init: string
  loading?: string
  confirming?: string
  reverted?: string
  confirmed?: string
  rejected?: string
  error?: string
  preparing?: string
  poolId?: string
}

export type StepType =
  | 'signBatchRelayer'
  | 'approveBatchRelayer'
  | 'tokenApproval'
  | 'addLiquidity'
  | 'removeLiquidity'
  | 'stakingDeposit'
  | 'stakingWithdraw'
  | 'minterApproval'
  | 'claimAndUnstake'
  | 'unstake'
  | 'claim'
  | 'swap'
  | 'crossChainSync'
  | LockActionType
  | 'signPermit'
  | 'signPermit2'

export type TxActionId =
  | 'SignBatchRelayer'
  | 'ApproveBatchRelayer'
  | 'TokenApproval'
  | 'AddLiquidity'
  | 'RemoveLiquidity'
  | 'StakingDeposit'
  | 'StakingWithdraw'
  | 'MinterApproval'
  | 'ClaimAndUnstake'
  | 'Claim'
  | 'Swap'

export type ManagedResult = TransactionBundle & Executable & { isSafeTxLoading: boolean }

/* This type unifies wagmi writeTransaction and sendTransaction types:
  execute is the union of write and sendTransaction functions
  executeAsync is the union of writeAsync and sendTransactionAsync functions
*/
type Executable = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  executeAsync?: Function
  setTxConfig?: any
}

// Defines extra details to be nested in the step tracker
export type StepDetails = {
  gasless: boolean
  // Token symbols of the tokens inside a batch approval (i.e. permit2)
  batchApprovalTokens?: string[]
}

export type TransactionStep = {
  id: string
  stepType: StepType
  details?: StepDetails
  labels: TransactionLabels
  isComplete: () => boolean
  renderAction: () => ReactNode
  // All callbacks should be idempotent
  onSuccess?: () => void
  onActivated?: () => void
  onDeactivated?: () => void
}

export function getTransactionState(transactionBundle?: TransactionBundle): TransactionState {
  if (!transactionBundle) return TransactionState.Ready
  const { simulation, execution, result } = transactionBundle

  if (simulation.isLoading || simulation.isPending) {
    return TransactionState.Preparing
  }
  if (execution.isPending) {
    return TransactionState.Loading
  }
  if (result.isSuccess) {
    return TransactionState.Completed
  }
  if (result.isLoading) {
    return TransactionState.Confirming
  }
  if (!simulation.isError && !execution.isError && !execution.data) {
    return TransactionState.Ready
  }
  if (simulation.isError || execution.isError || result.isError) {
    return TransactionState.Error
  }
  return TransactionState.Ready
}
