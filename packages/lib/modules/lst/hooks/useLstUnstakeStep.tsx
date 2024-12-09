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
import { useGetPenalty } from './useGetPenalty'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useLstUnstakeStep(humanAmount: string, chain: GqlChain) {
  const { getTransaction } = useTransactionState()
  const { isConnected } = useUserAccount()
  const { penalty } = useGetPenalty(parseUnits(humanAmount, 18), chain)

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

  const wrID = BigInt(Date.now()) // just get a unique ID here

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(chain),
    contractId: 'beets.lstStaking',
    contractAddress: networkConfigs[chain].contracts.beets?.lstStakingProxy || '',
    functionName: 'undelegate',
    args: [wrID, parseUnits(humanAmount, 18), penalty],
    enabled: isConnected && !!humanAmount,
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
      onSuccess: noop,
      renderAction: () => <ManagedTransactionButton id="unstakeLst" {...props} />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transaction]
  )
  return { step }
}
