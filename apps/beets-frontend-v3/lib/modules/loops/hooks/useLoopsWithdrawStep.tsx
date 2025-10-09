'use client'

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
import { parseUnits, zeroAddress } from 'viem'
import { BPT_DECIMALS } from '@repo/lib/modules/pool/pool.constants'
import { noop } from 'lodash'
import { bn } from '@repo/lib/shared/utils/numbers'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { useLoopsGetFlyQuote } from './useLoopsGetFlyQuote'
import { useLoopsGetCollateralAndDebtForShares } from '@/lib/modules/loops/hooks/useLoopsGetCollateralAndDebtForShares'
import { ConvertLstToWethMessage, getConvertLstToWethData } from '../getConvertLstToWethData'
import {} from '../getConvertLstToWethData'

export function useLoopsWithdrawStep(amountShares: string, chain: GqlChain, enabled: boolean) {
  const { isConnected } = useUserAccount()
  const { refetchBalances } = useTokenBalances()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const { collateralInLst } = useLoopsGetCollateralAndDebtForShares(amountShares, chain)

  const networkConfig = getNetworkConfig(chain)

  const flyQuoteParams = {
    fromTokenAddress: networkConfig.tokens.stakedAsset?.address || '',
    toTokenAddress: zeroAddress,
    sellAmount: collateralInLst.toString(),
    slippage: '0.005',
    fromAddress: '0xc325856e5585823aac0d1fd46c35c608d95e65a9',
    toAddress: '0xc325856e5585823aac0d1fd46c35c608d95e65a9',
    gasless: 'true',
    network: 'sonic',
  }

  console.log({ flyQuoteParams })

  const { data: flyQuote } = useLoopsGetFlyQuote(flyQuoteParams)

  const convertLstToWethData = getConvertLstToWethData(
    flyQuote?.typedData?.message as unknown as ConvertLstToWethMessage
  )

  console.log({ convertLstToWethData })

  const minWethAmountOut = 0n

  const labels: TransactionLabels = {
    init: 'Withdraw',
    title: 'Withdraw',
    confirming: 'Confirming withdraw...',
    confirmed: 'Withdrawn!',
    tooltip: 'tooltip',
  }

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(chain),
    contractId: 'beets.loopedSonicRouter',
    contractAddress: getNetworkConfig(chain).contracts.beets?.magpieLoopedSonicRouter || '',
    functionName: 'withdrawWithFlashLoan',
    args: [parseUnits(amountShares, BPT_DECIMALS), minWethAmountOut, convertLstToWethData || '0x'],
    enabled: bn(amountShares).gte(0) && isConnected && !!convertLstToWethData && enabled,
    onTransactionChange: setTransaction,
  }

  const isComplete = () => isConnected && isTransactionSuccess(transaction)

  const step: TransactionStep = {
    id: 'withdrawLoops',
    labels,
    stepType: 'withdrawLoops',
    transaction,
    isComplete,
    onActivated: noop,
    onDeactivated: noop,
    onSuccess: () => refetchBalances(),
    renderAction: () => <ManagedTransactionButton id="withdrawLoops" {...props} />,
  }

  return { step }
}
