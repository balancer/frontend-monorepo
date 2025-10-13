import { getChainId } from '@repo/lib/config/app.config'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useState } from 'react'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { parseUnits } from 'viem'
import { BPT_DECIMALS } from '@repo/lib/modules/pool/pool.constants'
import { noop } from 'lodash'
import { bn } from '@repo/lib/shared/utils/numbers'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'

export function useLoopsDepositStep(humanAmount: string, chain: GqlChain, enabled: boolean) {
  const { isConnected } = useUserAccount()
  const { refetchBalances } = useTokenBalances()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const labels: TransactionLabels = {
    init: 'Deposit',
    title: 'Deposit',
    confirming: 'Confirming deposit...',
    confirmed: 'Deposited!',
    tooltip: 'tooltip',
  }

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(chain),
    contractId: 'beets.loopedSonicRouter',
    contractAddress: getNetworkConfig(chain).contracts.beets?.magpieLoopedSonicRouter || '',
    functionName: 'deposit',
    args: [],
    value: parseUnits(humanAmount, BPT_DECIMALS),
    enabled: bn(humanAmount).gte(0) && isConnected && enabled,
    onTransactionChange: setTransaction,
  }

  const isComplete = () => isConnected && isTransactionSuccess(transaction)

  const step: TransactionStep = {
    id: 'depositLoops',
    labels,
    stepType: 'depositLoops',
    transaction,
    isComplete,
    onActivated: noop,
    onDeactivated: noop,
    onSuccess: () => refetchBalances(),
    renderAction: () => <ManagedTransactionButton id="depositLoops" {...props} />,
  }

  return { step }
}
