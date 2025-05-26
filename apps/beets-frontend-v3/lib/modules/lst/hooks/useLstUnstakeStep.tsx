'use client'

import { getChainId } from '@repo/lib/config/app.config'
import networkConfigs from '@repo/lib/config/networks'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useMemo, useState } from 'react'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { parseUnits } from 'viem'
import { noop } from 'lodash'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useGetUserWithdraws } from './useGetUserWithdraws'
import { useGetUserNumWithdraws } from './useGetUserNumWithdraws'
import { useGetAmountDelegatedPerValidator } from './useGetAmountDelegatedPerValidator'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'

export function useLstUnstakeStep(sharesAmount: string, chain: GqlChain, enabled: boolean) {
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const { isConnected } = useUserAccount()
  const { refetchBalances } = useTokenBalances()

  const { userNumWithdraws, refetch: refetchUserNumWithdraws } = useGetUserNumWithdraws(
    chain,
    enabled
  )

  const { refetch: refetchWithdrawals } = useGetUserWithdraws(chain, userNumWithdraws, enabled)
  const { chooseValidatorsForUnstakeAmount } = useGetAmountDelegatedPerValidator(chain)

  const validators = chooseValidatorsForUnstakeAmount(parseUnits(sharesAmount, 18))

  function onSuccess() {
    refetchBalances()
    refetchUserNumWithdraws()
    refetchWithdrawals()
  }

  const labels: TransactionLabels = {
    init: 'Unstake',
    title: 'Unstake',
    confirming: 'Confirming unstake...',
    confirmed: 'Unstaked!',
    tooltip: 'tooltip',
  }

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (LST unstaking transaction)',
    {}
  )

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(chain),
    contractId: 'beets.lstStaking',
    contractAddress: networkConfigs[chain].contracts.beets?.lstStakingProxy || '',
    functionName: 'undelegateMany',
    args: [
      validators.map(validator => BigInt(validator.validatorId)),
      validators.map(validator => validator.unstakeAmountShares),
    ],
    enabled: isConnected && !!sharesAmount && enabled,
    txSimulationMeta,
    onTransactionChange: setTransaction,
  }

  const isComplete = () => isConnected && isTransactionSuccess(transaction)

  const step = useMemo(
    (): TransactionStep => ({
      id: 'unstakeLst',
      labels,
      stepType: 'unstakeLst',
      isComplete,
      onActivated: noop,
      onDeactivated: noop,
      onSuccess,
      renderAction: () => <ManagedTransactionButton id="unstakeLst" {...props} />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transaction, props]
  )
  return { step }
}
