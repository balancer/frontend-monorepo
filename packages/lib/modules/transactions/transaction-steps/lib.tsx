import { TransactionBundle } from '@repo/lib/modules/web3/contracts/contract.types'
import { ReactNode } from 'react'
import { BaseTransaction } from '@safe-global/safe-apps-sdk'
import { Address, Hash } from 'viem'
import { ManagedTransactionInput } from '../../web3/contracts/useManagedTransaction'
import { ManagedErc20TransactionInput } from '../../web3/contracts/useManagedErc20Transaction'
import { ManagedSendTransactionInput } from '../../web3/contracts/useManagedSendTransaction'
import { LockActionType } from '../../vebal/vote/vote.types'

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
  | 'stakeLst'
  | 'unstakeLst'
  | 'withdrawLst'
  | 'voteForManyGaugeWeights'
  | 'levelUp'
  | 'claimRelicReward'
  | 'approveBatchRelayerForAllRelics'

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

export type TxCall = {
  to: Address
  data: Hash
  value?: bigint
}

export type SafeAppTx = BaseTransaction

export type TxBatch = SafeAppTx[]

/*
  Smart accounts, like Gnosis Safe, support batching multiple transactions into an atomic one
  We use the gnosis Safe Apps SDK to implement that feature:
  Repo and docs: https://github.com/safe-global/safe-apps-sdk/tree/main/packages/safe-apps-sdk#safe-apps-sdk

  Nice to have:
    It would be great to generalize the implementation to be supported by non Gnosis Safe,
    as other wallets like Coinbase wallet also support Smart Account features,
    However we found that wagmi is not fully supporting this features yet.
    More info:
    https://wagmi.sh/react/api/hooks/useSendCalls
    https://wagmi.sh/react/api/hooks/useCallsStatus
*/
type MaybeBatchableTx = {
  // TxCall representation of the TransactionStep when it must be executed inside a tx batch
  batchableTxCall?: TxCall
  /*
    true when the current transaction step is the last one in the batch
    Example:
    we have 3 transactions in a batch (2 token approval transactions and 1 add liquidity transaction)
    the add liquidity transaction should have isBatchEnd = true
  */
  isBatchEnd?: boolean
  // Used instead of renderAction when the step is a batch with uncompleted nested steps
  renderBatchAction?: (currentStep: TransactionStep) => React.ReactNode
  // Example: token approval steps are nested inside addLiquidity step
  nestedSteps?: TransactionStep[]
}

type TransactionInput =
  | ManagedTransactionInput
  | ManagedErc20TransactionInput
  | ManagedSendTransactionInput

export type TransactionStep = {
  id: string
  stepType: StepType
  details?: StepDetails
  labels: TransactionLabels
  isComplete: () => boolean
  renderAction: () => ReactNode
  // All callbacks should be idempotent
  onSuccess?: () => any
  onActivated?: () => void
  onDeactivated?: () => void
  // only used for integration testing
  _txInput?: TransactionInput
  transaction2?: ManagedResult
} & MaybeBatchableTx

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
