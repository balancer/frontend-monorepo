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
import { BPT_DECIMALS } from '@repo/lib/modules/pool/pool.constants'
import { noop } from 'lodash'
import { bn } from '@repo/lib/shared/utils/numbers'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'

export function useLstStakeStep(humanAmount: string, chain: GqlChain, enabled: boolean) {
  const { getTransaction } = useTransactionState()
  const { isConnected } = useUserAccount()
  const { refetchBalances } = useTokenBalances()

  const labels: TransactionLabels = {
    init: 'Stake',
    title: 'Stake',
    confirming: 'Confirming stake...',
    confirmed: 'Staked!',
    tooltip: 'tooltip',
  }

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (LST staking transaction)',
    {}
  )

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(chain),
    contractId: 'beets.lstStaking',
    contractAddress: networkConfigs[chain].contracts.beets?.lstStakingProxy || '',
    functionName: 'deposit',
    args: [],
    value: parseUnits(humanAmount, BPT_DECIMALS),
    enabled: bn(humanAmount).gte(0.01) && isConnected && enabled,
    txSimulationMeta,
  }

  const transaction = getTransaction('stakeLst')

  const isComplete = () => isConnected && !!transaction?.result.isSuccess

  const step = useMemo(
    (): TransactionStep => ({
      id: 'stakeLst',
      labels,
      stepType: 'stakeLst',
      isComplete,
      onActivated: noop,
      onDeactivated: noop,
      onSuccess: () => refetchBalances(),
      renderAction: () => <ManagedTransactionButton id="stakeLst" {...props} />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transaction]
  )
  return { step }
}
