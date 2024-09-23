/* eslint-disable react-hooks/exhaustive-deps */
import { ManagedTransactionButton } from '@/lib/modules/transactions/transaction-steps/TransactionButton'
import { useTransactionState } from '@/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import {
  TransactionLabels,
  TransactionStep,
} from '@/lib/modules/transactions/transaction-steps/lib'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { sentryMetaForWagmiSimulation } from '@/lib/shared/utils/query-errors'
import { useCallback, useMemo, useState } from 'react'
import { Pool, usePool } from '../../PoolProvider'
import { ManagedTransactionInput } from '@/lib/modules/web3/contracts/useManagedTransaction'

const stakeStepId = 'stake'

export function useStakeStep(pool: Pool, rawDepositAmount: bigint): TransactionStep {
  const [isStakeEnabled, setIsStakeEnabled] = useState(false)

  const { refetch: refetchPool, chainId } = usePool()
  const { getTransaction } = useTransactionState()
  const { userAddress } = useUserAccount()

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

  const transaction = getTransaction(stakeStepId)

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
    }),
    [chainId, isStakeEnabled, labels, pool.staking, rawDepositAmount, txSimulationMeta]
  )

  const onSuccess = useCallback(() => {
    refetchPool()
  }, [])

  const step: TransactionStep = useMemo(
    () => ({
      id: stakeStepId,
      stepType: 'stakingDeposit',
      labels,
      isComplete: () => transaction?.result.isSuccess || false,
      onActivated: () => setIsStakeEnabled(true),
      onDeactivated: () => setIsStakeEnabled(false),
      onSuccess,
      renderAction: () => <ManagedTransactionButton id={stakeStepId} {...props} />,
    }),
    [labels, onSuccess, transaction?.result.isSuccess, props]
  )

  return step
}
