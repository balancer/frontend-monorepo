/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useTokens } from '@/lib/modules/tokens/TokensProvider'
import { GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@/lib/shared/utils/contexts'
import { HumanAmount } from '@balancer/sdk'
import { PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react'
import { Address, Hash } from 'viem'
import { usePool } from '../../PoolProvider'
import { useAddLiquiditySimulationQuery } from './queries/useAddLiquiditySimulationQuery'
import { useAddLiquidityPriceImpactQuery } from './queries/useAddLiquidityPriceImpactQuery'
import {
  LiquidityActionHelpers,
  areEmptyAmounts,
  filterHumanAmountsIn,
  injectNativeAsset,
  replaceWrappedWithNativeAsset,
  requiresProportionalInput,
  supportsNestedActions,
} from '../LiquidityActionHelpers'
import { isDisabledWithReason } from '@/lib/shared/utils/functions/isDisabledWithReason'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { LABELS } from '@/lib/shared/labels'
import { selectAddLiquidityHandler } from './handlers/selectAddLiquidityHandler'
import { useTokenInputsValidation } from '@/lib/modules/tokens/TokenInputsValidationProvider'
import { useAddLiquiditySteps } from './useAddLiquiditySteps'
import { useTransactionSteps } from '@/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useTotalUsdValue } from '@/lib/modules/tokens/useTotalUsdValue'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'
import { isUnhandledAddPriceImpactError } from '@/lib/modules/price-impact/price-impact.utils'
import { useModalWithPoolRedirect } from '../../useModalWithPoolRedirect'
import { getLeafTokens } from '@/lib/modules/tokens/token.helpers'

export type UseAddLiquidityResponse = ReturnType<typeof _useAddLiquidity>
export const AddLiquidityContext = createContext<UseAddLiquidityResponse | null>(null)

export function _useAddLiquidity(urlTxHash?: Hash) {
  const [humanAmountsIn, setHumanAmountsIn] = useState<HumanTokenAmountWithAddress[]>([])
  const [needsToAcceptHighPI, setNeedsToAcceptHighPI] = useState(false)
  const [acceptPoolRisks, setAcceptPoolRisks] = useState(false)
  const [wethIsEth, setWethIsEth] = useState(false)
  const [totalUSDValue, setTotalUSDValue] = useState('0')

  const { pool, refetch: refetchPool, isLoading } = usePool()
  const { getToken, getNativeAssetToken, getWrappedNativeAssetToken, isLoadingTokenPrices } =
    useTokens()
  const { isConnected } = useUserAccount()
  const { hasValidationErrors } = useTokenInputsValidation()

  const handler = useMemo(() => selectAddLiquidityHandler(pool), [pool.id, isLoading])

  /**
   * Helper functions & variables
   */
  const helpers = new LiquidityActionHelpers(pool)

  const chain = pool.chain
  const nativeAsset = getNativeAssetToken(chain)
  const wNativeAsset = getWrappedNativeAssetToken(chain)

  function setInitialHumanAmountsIn() {
    const amountsIn = getPoolTokens().map(
      token =>
        ({
          tokenAddress: token.address,
          humanAmount: '',
        } as HumanTokenAmountWithAddress)
    )
    setHumanAmountsIn(amountsIn)
  }

  function setHumanAmountIn(tokenAddress: Address, humanAmount: HumanAmount | '') {
    const amountsIn = filterHumanAmountsIn(humanAmountsIn, tokenAddress, chain)
    setHumanAmountsIn([
      ...amountsIn,
      {
        tokenAddress,
        humanAmount,
      },
    ])
  }

  function getPoolTokens() {
    if (supportsNestedActions(pool)) {
      return getLeafTokens(pool.poolTokens)
    }

    return pool.poolTokens
  }

  const tokens = getPoolTokens()
    .map(token => getToken(token.address, chain))
    .filter((token): token is GqlToken => !!token)

  const tokensWithNativeAsset = replaceWrappedWithNativeAsset(tokens, nativeAsset)

  const validTokens = injectNativeAsset(tokens, nativeAsset, pool)

  const { usdValueFor } = useTotalUsdValue(validTokens)

  useEffect(() => {
    if (!isLoadingTokenPrices) {
      setTotalUSDValue(usdValueFor(humanAmountsIn))
    }
  }, [humanAmountsIn, isLoadingTokenPrices])

  /**
   * Queries
   */
  const simulationQuery = useAddLiquiditySimulationQuery({
    handler,
    humanAmountsIn,
    enabled: !urlTxHash,
  })
  const priceImpactQuery = useAddLiquidityPriceImpactQuery({
    handler,
    humanAmountsIn,
    enabled: !urlTxHash,
  })

  /**
   * Step construction
   */
  const { steps, isLoadingSteps } = useAddLiquiditySteps({
    helpers,
    handler,
    humanAmountsIn,
    simulationQuery,
  })
  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)

  const addLiquidityTxHash =
    urlTxHash || transactionSteps.lastTransaction?.result?.data?.transactionHash

  const addLiquidityTxSuccess = transactionSteps.lastTransactionConfirmed

  const hasQuoteContext = !!simulationQuery.data

  async function refetchQuote() {
    if (requiresProportionalInput(pool.type)) {
      /*
      This is the only edge-case where the SDK needs pool onchain data from the frontend
      (calculateProportionalAmounts uses pool.dynamicData.totalShares in its parameters)
      so we must refetch pool data
      */
      await refetchPool()
    }
    await Promise.all([simulationQuery.refetch(), priceImpactQuery.refetch()])
  }

  // On initial render, set the initial humanAmountsIn
  useEffect(() => {
    setInitialHumanAmountsIn()
  }, [])

  const disabledConditions: [boolean, string][] = [
    [!isConnected, LABELS.walletNotConnected],
    [areEmptyAmounts(humanAmountsIn), 'You must specify one or more token amounts'],
    [hasValidationErrors, 'Errors in token inputs'],
    [needsToAcceptHighPI, 'Accept high price impact first'],
    [simulationQuery.isLoading, 'Fetching quote...'],
    [simulationQuery.isError, 'Error fetching quote'],
    [priceImpactQuery.isLoading, 'Fetching price impact...'],
    [isUnhandledAddPriceImpactError(priceImpactQuery.error), 'Error fetching price impact'],
  ]

  const { isDisabled: isPreDisabled } = isDisabledWithReason(...disabledConditions)
  const showAcceptPoolRisks = acceptPoolRisks || (!isPreDisabled && !!simulationQuery.data)

  const allDisabledConditions: [boolean, string][] = [
    ...disabledConditions,
    [!acceptPoolRisks, 'Please accept the pool risks first'],
  ]
  const { isDisabled, disabledReason } = isDisabledWithReason(...allDisabledConditions)

  const previewModalDisclosure = useModalWithPoolRedirect(pool, addLiquidityTxHash)

  return {
    transactionSteps,
    humanAmountsIn,
    tokens: wethIsEth ? tokensWithNativeAsset : tokens,
    validTokens,
    totalUSDValue,
    simulationQuery,
    priceImpactQuery,
    isDisabled,
    showAcceptPoolRisks,
    disabledReason,
    previewModalDisclosure,
    handler,
    helpers,
    acceptPoolRisks,
    wethIsEth,
    nativeAsset,
    wNativeAsset,
    urlTxHash,
    addLiquidityTxHash,
    hasQuoteContext,
    addLiquidityTxSuccess,
    refetchQuote,
    setHumanAmountIn,
    setHumanAmountsIn,
    setNeedsToAcceptHighPI,
    setAcceptPoolRisks,
    setWethIsEth,
    setInitialHumanAmountsIn,
  }
}

type Props = PropsWithChildren<{
  urlTxHash?: Hash
}>

export function AddLiquidityProvider({ urlTxHash, children }: Props) {
  const hook = _useAddLiquidity(urlTxHash)
  return <AddLiquidityContext.Provider value={hook}>{children}</AddLiquidityContext.Provider>
}

export const useAddLiquidity = (): UseAddLiquidityResponse =>
  useMandatoryContext(AddLiquidityContext, 'AddLiquidity')
