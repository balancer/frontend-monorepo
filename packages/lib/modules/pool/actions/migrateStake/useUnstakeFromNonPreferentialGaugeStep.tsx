/* eslint-disable react-hooks/exhaustive-deps */
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useCallback, useMemo, useState } from 'react'
import { parseUnits } from 'viem'
import { Pool } from '../../pool.types'
import { BPT_DECIMALS } from '../../pool.constants'
import { findFirstNonPreferentialStaking } from '../stake.helpers'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'

const unstakeStepId = 'unstake-non-preferential-gauge'
/*
  Only used in the edge case of a user staked in a non-preferential gauge that is not claimable.
  In this case we run a single unstake transaction instead of unstake + claim multicall.
  See isClaimableGauge function for more details about non claimable gauges.
*/
export function useUnstakeFromNonPreferentialGaugeStep(
  pool: Pool,
  refetchPoolBalances: () => void
) {
  const { userAddress } = useUserAccount()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const { chainId } = getNetworkConfig(pool.chain)

  const { nonPreferentialGaugeAddress, nonPreferentialStakedBalance } =
    findFirstNonPreferentialStaking(pool)

  const labels: TransactionLabels = {
    init: 'Unstake from deprecated gauge',
    title: 'Unstake LP tokens',
    description: 'Unstake LP tokens from deprecated gauge.',
    confirming: 'Confirming unstake...',
    confirmed: `Unstaked!`,
    tooltip: 'Unstake LP tokens from deprecated gauge.',
  }

  const amount = parseUnits(nonPreferentialStakedBalance, BPT_DECIMALS)

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (Unstake from non preferential gauge transaction)',
    {
      poolId: pool.id,
      chainId,
      amount,
    }
  )

  const props: ManagedTransactionInput = {
    contractAddress: nonPreferentialGaugeAddress,
    contractId: 'balancer.gaugeV5',
    functionName: 'withdraw',
    labels,
    chainId,
    args: [amount],
    enabled: !!pool && !!userAddress,
    txSimulationMeta,
    onTransactionChange: setTransaction,
  }

  const onSuccess = useCallback(() => {
    refetchPoolBalances()
  }, [])

  const step = useMemo(
    (): TransactionStep => ({
      id: unstakeStepId,
      stepType: 'unstake',
      labels,
      isComplete: () => isTransactionSuccess(transaction),
      onSuccess,
      renderAction: () => <ManagedTransactionButton id={unstakeStepId} {...props} />,
    }),
    [transaction, amount, props]
  )

  return {
    step,
  }
}
