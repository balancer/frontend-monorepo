/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { HumanAmount, isSameAddress } from '@balancer/sdk'
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
import { supportsWethIsEth } from '../../pool.helpers'
import { getPoolActionableTokens, getWrappedBoostedTokens } from '../../pool-tokens.utils'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { isUnbalancedAddErrorMessage } from '@repo/lib/shared/utils/error-filters'
import { getDefaultProportionalSlippagePercentage } from '@repo/lib/shared/utils/slippage'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { useIsMinimumDepositMet } from './useIsMinimumDepositMet'
import { useWrapUnderlying } from '../useWrapUnderlying'

export type UseAddLiquidityResponse = ReturnType<typeof _useAddLiquidity>
export const AddLiquidityContext = createContext<UseAddLiquidityResponse | null>(null)

export function _useAddLiquidity(urlTxHash?: Hash, relicId?: string) {
  const [humanAmountsIn, setHumanAmountsIn] = useState<HumanTokenAmountWithAddress[]>([])
  // only used by Proportional handlers that require a referenceAmount
  const [referenceAmountAddress, setReferenceAmountAddress] = useState<Address | undefined>()
  const [needsToAcceptHighPI, setNeedsToAcceptHighPI] = useState(false)
  const [acceptPoolRisks, setAcceptPoolRisks] = useState(false)
  const [wethIsEth, setWethIsEth] = useState(false)

  const [totalUSDValue, setTotalUSDValue] = useState('0')
  const { pool, refetch: refetchPool, isLoading } = usePool()
  const { wrapUnderlying, setWrapUnderlyingByIndex } = useWrapUnderlying(pool)
  /* wantsProportional is true when:
    - the pool requires proportional input
    - the user selected the proportional tab
  */
  const [wantsProportional, setWantsProportional] = useState(requiresProportionalInput(pool))
  const [proportionalSlippage, setProportionalSlippage] = useState<string>(
    getDefaultProportionalSlippagePercentage(pool)
  )

  const { getNativeAssetToken, getWrappedNativeAssetToken, isLoadingTokenPrices } = useTokens()

  const { isConnected } = useUserAccount()
  const { hasValidationErrors } = useTokenInputsValidation()
  const { slippage: userSlippage } = useUserSettings()

  const handler = useMemo(
    () => selectAddLiquidityHandler(pool, wantsProportional),
    [pool.id, isLoading, wantsProportional]
  )

  /**
   * Helper functions & variables
   */
  const helpers = new LiquidityActionHelpers(pool)

  const chain = pool.chain
  const nativeAsset = getNativeAssetToken(chain)
  const wNativeAsset = getWrappedNativeAssetToken(chain)
  const slippage = wantsProportional ? proportionalSlippage : userSlippage

  // Actionable tokens selected in the add form
  const tokens = getPoolActionableTokens(pool, wrapUnderlying)

  // All tokens that can be used in the pool form
  // standard tokens + wrapped/native asset (when wrapped native asset is present) + wrapped/underlying tokens (when the token is boosted)
  const validTokens = [
    ...injectNativeAsset(getPoolActionableTokens(pool), nativeAsset, pool),
    ...getWrappedBoostedTokens(pool),
  ]

  const { usdValueFor } = useTotalUsdValue(validTokens)

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

  function setHumanAmountIn(token: ApiToken, humanAmount: HumanAmount | '') {
    const tokenAddress = token.address as Address
    const amountsIn = filterHumanAmountsIn(humanAmountsIn, tokenAddress, chain)
    setHumanAmountsIn([
      ...amountsIn,
      {
        tokenAddress,
        humanAmount,
        symbol: token.symbol,
      },
    ])
  }

  function clearAmountsIn(changedAmount?: HumanTokenAmountWithAddress) {
    setHumanAmountsIn(
      humanAmountsIn.map(({ tokenAddress, symbol }) => {
        // Keeps user inputs like '0' or '0.' instead of replacing them with ''
        if (changedAmount && isSameAddress(changedAmount.tokenAddress, tokenAddress)) {
          return changedAmount
        }

        return { tokenAddress, humanAmount: '', symbol }
      })
    )
  }

  const tokensWithNativeAsset = replaceWrappedWithNativeAsset(tokens, nativeAsset)

  useEffect(() => {
    if (!isLoadingTokenPrices) {
      setTotalUSDValue(usdValueFor(humanAmountsIn))
    }
  }, [humanAmountsIn, isLoadingTokenPrices])

  const isMinimumDepositMet = useIsMinimumDepositMet({ humanAmountsIn, totalUSDValue })

  /**
   * Queries
   */
  const enabled = !urlTxHash && isMinimumDepositMet

  const simulationQuery = useAddLiquiditySimulationQuery({
    handler,
    humanAmountsIn,
    enabled,
    referenceAmountAddress,
  })

  const priceImpactQuery = useAddLiquidityPriceImpactQuery({
    handler,
    humanAmountsIn,
    enabled,
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
    relicId,
  })
  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)

  const addLiquidityTxHash =
    urlTxHash || transactionSteps.lastTransaction?.result?.data?.transactionHash

  const addLiquidityTxSuccess = transactionSteps.lastTransactionConfirmed

  const hasQuoteContext = !!simulationQuery.data

  async function refetchQuote() {
    if (wantsProportional) {
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
    [!isMinimumDepositMet, 'Minimum deposit not met for a Boosted Pool'],
    [hasValidationErrors, 'Errors in token inputs'],
    [needsToAcceptHighPI, 'Accept high price impact first'],
    [
      isUnbalancedAddErrorMessage(priceImpactQuery.error) && !supportsNestedActions(pool),
      'Unbalanced join',
    ],
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
    tokens: wethIsEth && supportsWethIsEth(pool) ? tokensWithNativeAsset : tokens,
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
    wantsProportional,
    referenceAmountAddress,
    setWantsProportional,
    setProportionalSlippage,
    refetchQuote,
    setHumanAmountIn,
    setHumanAmountsIn,
    clearAmountsIn,
    setReferenceAmountAddress,
    setNeedsToAcceptHighPI,
    setAcceptPoolRisks,
    setWethIsEth,
    setWrapUnderlyingByIndex,
    wrapUnderlying,
    setInitialHumanAmountsIn,
  }
}

type Props = PropsWithChildren<{
  urlTxHash?: Hash
  relicId?: string
}>

export function AddLiquidityProvider({ urlTxHash, relicId, children }: Props) {
  const hook = _useAddLiquidity(urlTxHash, relicId)
  return <AddLiquidityContext.Provider value={hook}>{children}</AddLiquidityContext.Provider>
}

export const useAddLiquidity = (): UseAddLiquidityResponse =>
  useMandatoryContext(AddLiquidityContext, 'AddLiquidity')
