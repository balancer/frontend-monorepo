/* eslint-disable react-hooks/exhaustive-deps */
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useCallback, useMemo, useState } from 'react'
import { usePool } from '../../PoolProvider'
import { Pool } from '../../pool.types'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'

const stakeStepId = 'stake'

export function useStakeStep(pool: Pool, rawDepositAmount: bigint): TransactionStep {
  const [isStakeEnabled, setIsStakeEnabled] = useState(false)

  const { refetch: refetchPool, chainId } = usePool()
  const { userAddress } = useUserAccount()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const labels: TransactionLabels = useMemo(
    () => ({
      init: 'Stake LP tokens',
      title: 'Stake LP tokens',
      description: 'Stake LP tokens in a pool to earn rewards',
      confirming: 'Confirming stake...',
      confirmed: `LP tokens deposited in ${pool.staking?.type}!`,
      tooltip: 'Stake LP tokens in a pool to earn rewards',
    }),
    [pool.staking]
  )

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (Staking deposit transaction)',
    {
      chainId,
      userAddress,
      staking: pool.staking,
      rawDepositAmount,
    }
  )

  const props: ManagedTransactionInput = useMemo(
    () => ({
      enabled: (isStakeEnabled && !!pool.staking) || !!rawDepositAmount,
      labels,
      chainId,
      contractId: 'balancer.gaugeV5',
      contractAddress: pool.staking?.gauge?.gaugeAddress || '',
      functionName: 'deposit',
      args: [rawDepositAmount || 0n],
      txSimulationMeta,
      onTransactionChange: setTransaction,
    }),
    [chainId, isStakeEnabled, labels, pool.staking, rawDepositAmount, txSimulationMeta, transaction]
  )

  const onSuccess = useCallback(() => {
    refetchPool()
  }, [])

  const step: TransactionStep = useMemo(
    () => ({
      id: stakeStepId,
      stepType: 'stakingDeposit',
      labels,
      transaction,
      isComplete: () => isTransactionSuccess(transaction),
      onActivated: () => setIsStakeEnabled(true),
      onDeactivated: () => setIsStakeEnabled(false),
      onSuccess,
      renderAction: () => <ManagedTransactionButton id={stakeStepId} {...props} />,
    }),
    [labels, onSuccess, transaction?.result.isSuccess, props]
  )

  return step
}
