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
import { useGetRelicPositionsOfOwner } from '@/lib/modules/reliquary/hooks/useGetRelicPositionsOfOwner'

export function useLevelUpStep(chain: GqlChain, relicId: string | undefined) {
  const { getTransaction } = useTransactionState()
  const { isConnected } = useUserAccount()
  const { refetch } = useGetRelicPositionsOfOwner(chain)

  const labels: TransactionLabels = {
    init: 'Level up',
    title: 'Level up',
    confirming: 'Confirming level up...',
    confirmed: 'Level up!',
    tooltip: 'tooltip',
  }

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (Level up transaction)',
    {}
  )

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(chain),
    contractId: 'beets.reliquary',
    contractAddress: networkConfigs[chain].contracts.beets?.reliquary || '',
    functionName: 'updatePosition',
    args: relicId ? [relicId] : null,
    enabled: isConnected && !!relicId,
    txSimulationMeta,
  }

  const transaction = getTransaction('levelUp')

  const isComplete = () => isConnected && !!transaction?.result.isSuccess

  const step = useMemo(
    (): TransactionStep => ({
      id: 'levelUp',
      labels,
      stepType: 'levelUp',
      isComplete,
      onActivated: noop,
      onDeactivated: noop,
      onSuccess: () => refetch(),
      renderAction: () => <ManagedTransactionButton id="levelUp" {...props} />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transaction]
  )
  return { step }
}
