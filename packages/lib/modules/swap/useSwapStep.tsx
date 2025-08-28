import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { VStack } from '@chakra-ui/react'
import { capitalize } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { BuildSwapQueryParams, useBuildSwapQuery } from './queries/useBuildSwapQuery'
import { swapActionPastTense } from './swap.helpers'
import { SwapAction } from './swap.types'
import { useTokenBalances } from '../tokens/TokenBalancesProvider'
import { useUserAccount } from '../web3/UserAccountProvider'
import { useTenderly } from '../web3/useTenderly'
import { getChainId } from '@repo/lib/config/app.config'
import { DisabledTransactionButton } from '../transactions/transaction-steps/TransactionStepButton'
import { ApiToken } from '../tokens/token.types'
import { isTransactionSuccess } from '../transactions/transaction-steps/transaction.helper'

const swapStepId = 'swap'

export type SwapStepParams = BuildSwapQueryParams & {
  swapAction: SwapAction
  tokenInInfo: ApiToken | undefined
  tokenOutInfo: ApiToken | undefined
  isLbpSwap: boolean
  isLbpProjectTokenBuy: boolean
}

export function useSwapStep({
  handler,
  simulationQuery,
  swapState,
  swapAction,
  wethIsEth,
  tokenInInfo,
  tokenOutInfo,
  isLbpSwap,
  isLbpProjectTokenBuy,
}: SwapStepParams): TransactionStep {
  const { isConnected } = useUserAccount()
  const [isBuildQueryEnabled, setIsBuildQueryEnabled] = useState(false)
  const { refetchBalances } = useTokenBalances()
  const { buildTenderlyUrl } = useTenderly({
    chainId: getChainId(swapState.selectedChain),
  })
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const buildSwapQuery = useBuildSwapQuery({
    handler,
    simulationQuery,
    wethIsEth,
    swapState,
    enabled: isBuildQueryEnabled && !!simulationQuery.data,
  })

  const tokenInSymbol = tokenInInfo?.symbol || 'Unknown'
  const tokenOutSymbol = tokenOutInfo?.symbol || 'Unknown'

  const labels: TransactionLabels = isLbpSwap
    ? isLbpProjectTokenBuy
      ? {
          init: 'Buy',
          title: 'Buy',
          confirming: 'Confirming buy...',
          confirmed: 'Buy confirmed!',
          tooltip: `Buy ${tokenOutSymbol}`,
        }
      : {
          init: 'Sell',
          title: 'Sell',
          confirming: 'Confirming sell...',
          confirmed: 'Sell confirmed!',
          tooltip: `Sell ${tokenInSymbol}`,
        }
    : {
        init: capitalize(swapAction),
        title: capitalize(swapAction),
        confirming: 'Confirming swap...',
        confirmed: `${swapActionPastTense(swapAction)}!`,
        tooltip: `${capitalize(swapAction)} ${tokenInSymbol} for ${tokenOutSymbol}`,
        description: `${capitalize(swapAction)} ${tokenInSymbol} for ${tokenOutSymbol}`,
      }

  useEffect(() => {
    // simulationQuery is refetched every 30 seconds by SwapTimeout
    if (simulationQuery.data && isConnected) {
      buildSwapQuery.refetch()
    }
  }, [simulationQuery.data])

  const gasEstimationMeta = sentryMetaForWagmiSimulation('Error in swap gas estimation', {
    buildCallQueryData: buildSwapQuery.data,
    tenderlyUrl: buildTenderlyUrl(buildSwapQuery.data),
  })

  const isComplete = () => isTransactionSuccess(transaction)

  return useMemo(
    () => ({
      id: swapStepId,
      stepType: 'swap',
      labels,
      details: {
        gasless: false,
        type: 'Gas transaction',
      },
      transaction,
      isComplete,
      onActivated: () => setIsBuildQueryEnabled(true),
      onDeactivated: () => setIsBuildQueryEnabled(false),
      onSuccess: () => refetchBalances(),
      renderAction: () => {
        if (!buildSwapQuery.data) return <DisabledTransactionButton />
        return (
          <VStack w="full">
            <ManagedSendTransactionButton
              gasEstimationMeta={gasEstimationMeta}
              id={swapStepId}
              labels={labels}
              onTransactionChange={setTransaction}
              txConfig={buildSwapQuery.data}
            />
          </VStack>
        )
      },
    }),
    [transaction, simulationQuery.data, buildSwapQuery.data]
  )
}
