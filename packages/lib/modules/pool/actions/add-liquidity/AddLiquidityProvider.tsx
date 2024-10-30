/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
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
} from '../LiquidityActionHelpers'
import { isDisabledWithReason } from '@repo/lib/shared/utils/functions/isDisabledWithReason'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { LABELS } from '@repo/lib/shared/labels'
import { selectAddLiquidityHandler } from './handlers/selectAddLiquidityHandler'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { useAddLiquiditySteps } from './useAddLiquiditySteps'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useTotalUsdValue } from '@repo/lib/modules/tokens/useTotalUsdValue'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { isUnhandledAddPriceImpactError } from '@repo/lib/modules/price-impact/price-impact.utils'
import { useModalWithPoolRedirect } from '../../useModalWithPoolRedirect'
import { getPoolActionableTokens } from '../../pool.helpers'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { isUnbalancedAddErrorMessage } from '@repo/lib/shared/utils/error-filters'

export type UseAddLiquidityResponse = ReturnType<typeof _useAddLiquidity>
export const AddLiquidityContext = createContext<UseAddLiquidityResponse | null>(null)

export function _useAddLiquidity(urlTxHash?: Hash) {
  const [humanAmountsIn, setHumanAmountsIn] = useState<HumanTokenAmountWithAddress[]>([])
  const [needsToAcceptHighPI, setNeedsToAcceptHighPI] = useState(false)
  const [acceptPoolRisks, setAcceptPoolRisks] = useState(false)
  const [wethIsEth, setWethIsEth] = useState(false)
  const [totalUSDValue, setTotalUSDValue] = useState('0')
  const [proportionalSlippage, setProportionalSlippage] = useState<string>('0')

  const { pool, refetch: refetchPool, isLoading } = usePool()
  const { getToken, getNativeAssetToken, getWrappedNativeAssetToken, isLoadingTokenPrices } =
    useTokens()
  const { isConnected } = useUserAccount()
  const { hasValidationErrors } = useTokenInputsValidation()
  const { slippage: userSlippage } = useUserSettings()

  const handler = useMemo(() => selectAddLiquidityHandler(pool), [pool.id, isLoading])

  /**
   * Helper functions & variables
   */
  const helpers = new LiquidityActionHelpers(pool)

  const chain = pool.chain
  const nativeAsset = getNativeAssetToken(chain)
  const wNativeAsset = getWrappedNativeAssetToken(chain)
  const isForcedProportionalAdd = requiresProportionalInput(pool)
  const slippage = isForcedProportionalAdd ? proportionalSlippage : userSlippage
  const tokens = getPoolActionableTokens(pool, getToken)

  function setInitialHumanAmountsIn() {
    const amountsIn = tokens.map(
      token =>
        ({
          tokenAddress: token.address,
          humanAmount: '',
        }) as HumanTokenAmountWithAddress
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
    slippage,
  })
  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)

  const addLiquidityTxHash =
    urlTxHash || transactionSteps.lastTransaction?.result?.data?.transactionHash

  const addLiquidityTxSuccess = transactionSteps.lastTransactionConfirmed

  const hasQuoteContext = !!simulationQuery.data

  async function refetchQuote() {
    if (isForcedProportionalAdd) {
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
    [isUnbalancedAddErrorMessage(priceImpactQuery.error), 'Unbalanced join'],
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
    slippage,
    proportionalSlippage,
    isForcedProportionalAdd,
    setProportionalSlippage,
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
