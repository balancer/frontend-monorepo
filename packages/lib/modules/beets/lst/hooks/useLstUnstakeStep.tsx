'use client'

import { getChainId } from '@repo/lib/config/app.config'
import networkConfigs from '@repo/lib/config/networks'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { useTransactionState } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import {
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useMemo } from 'react'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { parseUnits } from 'viem'
import { noop } from 'lodash'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useGetUserWithdraws } from './useGetUserWithdraws'
import { useGetUserNumWithdraws } from './useGetUserNumWithdraws'
import { useGetAmountDelegatedPerValidator } from './useGetAmountDelegatedPerValidator'

export function useLstUnstakeStep(sharesAmount: string, chain: GqlChain, enabled: boolean) {
  const { getTransaction } = useTransactionState()
  const { isConnected } = useUserAccount()
  const { refetchBalances } = useTokenBalances()
  const { userNumWithdraws, refetch: refetchUserNumWithdraws } = useGetUserNumWithdraws(chain)
  const { refetch: refetchWithdrawals } = useGetUserWithdraws(chain, userNumWithdraws)
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
    //args: [[BigInt(1)], [parseUnits(sharesAmount, 18)]], // TODO: make dynamic
    args: [
      validators.map(validator => BigInt(validator.validatorId)),
      validators.map(validator => validator.unstakeAmountAssets),
    ],
    enabled: isConnected && !!sharesAmount && enabled,
    txSimulationMeta,
  }

  const transaction = getTransaction('unstakeLst')

  const isComplete = () => isConnected && !!transaction?.result.isSuccess

  const step = useMemo(
    (): TransactionStep => ({
      id: 'unstakeLst',
      labels,
      stepType: 'unstakeLst',
      isComplete,
      onActivated: noop,
      onDeactivated: noop,
      onSuccess: onSuccess,
      renderAction: () => <ManagedTransactionButton id="unstakeLst" {...props} />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transaction]
  )
  return { step }
}
