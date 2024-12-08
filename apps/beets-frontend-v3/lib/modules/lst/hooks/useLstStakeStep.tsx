import { getChainId } from '@repo/lib/config/app.config'
import networkConfigs from '@repo/lib/config/networks'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { useTransactionState } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import {
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useMemo } from 'react'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { parseUnits } from 'viem'
import { BPT_DECIMALS } from '@repo/lib/modules/pool/pool.constants'
import { noop } from 'lodash'
import { bn } from '@repo/lib/shared/utils/numbers'

export function useLstStakeStep(humanAmount: string) {
  const { getTransaction } = useTransactionState()
  const { isConnected } = useUserAccount()

  const labels: TransactionLabels = {
    init: 'Stake',
    title: 'Stake',
    confirming: 'Confirming stake...',
    confirmed: 'Staked!',
    tooltip: 'tooltip',
  }

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (Liquid staking transaction)',
    {}
  )

  const chain = GqlChain.Fantom

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(chain),
    contractId: 'beets.lstStaking',
    contractAddress: networkConfigs[chain].contracts.beets?.lstStakingProxy || '',
    functionName: 'deposit',
    args: [],
    value: parseUnits(humanAmount, BPT_DECIMALS),
    enabled: bn(humanAmount).gte(1) && isConnected,
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
      onSuccess: noop,
      renderAction: () => <ManagedTransactionButton id="stakeLst" {...props} />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transaction]
  )
  return { step }
}
