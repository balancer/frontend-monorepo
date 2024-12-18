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
import { noop } from 'lodash'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'

export function useLstWithdrawStep(
  humanAmount: string,
  chain: GqlChain,
  enabled: boolean,
  wrID: bigint | undefined
) {
  const { getTransaction } = useTransactionState()
  const { isConnected } = useUserAccount()
  const { refetchBalances } = useTokenBalances()

  const labels: TransactionLabels = {
    init: 'Withdraw',
    title: 'Withdraw',
    confirming: 'Confirming withdraw...',
    confirmed: 'Withdrawn!',
    tooltip: 'tooltip',
  }

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (LST withdrawing transaction)',
    {}
  )

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(chain),
    contractId: 'beets.lstStaking',
    contractAddress: networkConfigs[chain].contracts.beets?.lstStakingProxy || '',
    functionName: 'withdraw',
    args: [wrID || 0n, 0n],
    enabled: isConnected && !!humanAmount && enabled && !!wrID,
    txSimulationMeta,
  }

  const transaction = getTransaction('withdrawLst')

  const isComplete = () => isConnected && !!transaction?.result.isSuccess

  const step = useMemo(
    (): TransactionStep => ({
      id: 'withdrawLst',
      labels,
      stepType: 'withdrawLst',
      isComplete,
      onActivated: noop,
      onDeactivated: noop,
      onSuccess: () => refetchBalances(),
      renderAction: () => <ManagedTransactionButton id="withdrawLst" {...props} />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transaction]
  )
  return { step }
}
