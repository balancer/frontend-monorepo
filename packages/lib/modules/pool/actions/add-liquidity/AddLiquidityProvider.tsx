'use client'

import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { HumanAmount, isSameAddress } from '@balancer/sdk'
import { PropsWithChildren, createContext, useMemo, useState } from 'react'
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
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { isUnhandledAddPriceImpactError } from '@repo/lib/modules/price-impact/price-impact.utils'
import { useModalWithPoolRedirect } from '../../useModalWithPoolRedirect'
import { supportsWethIsEth } from '../../pool.helpers'
import { getPoolActionableTokens, getWrappedBoostedTokens } from '../../pool-tokens.utils'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { isUnbalancedAddErrorMessage } from '@repo/lib/shared/utils/error-filters'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { useIsMinimumDepositMet } from './useIsMinimumDepositMet'
import { useWrapUnderlying } from '../useWrapUnderlying'

function mapTokensToEmptyHumanAmounts(tokens: ApiToken[]): HumanTokenAmountWithSymbol[] {
  return tokens.map(
    token =>
      ({
        tokenAddress: token.address as Address,
        humanAmount: '',
      }) as HumanTokenAmountWithSymbol
  )
}

export type UseAddLiquidityResponse = ReturnType<typeof useAddLiquidityLogic>
export const AddLiquidityContext = createContext<UseAddLiquidityResponse | null>(null)

export function useAddLiquidityLogic(urlTxHash?: Hash) {
  const { pool, refetch: refetchPool, isLoading } = usePool()
  const { wrapUnderlying, setWrapUnderlyingByIndex } = useWrapUnderlying(pool)

  // Actionable tokens selected in the add form
  const tokens = getPoolActionableTokens(pool, wrapUnderlying)

  const [humanAmountsIn, setHumanAmountsIn] = useState<HumanTokenAmountWithSymbol[]>(() =>
    mapTokensToEmptyHumanAmounts(tokens)
  )
  // only used by Proportional handlers that require a referenceAmount
  const [referenceAmountAddress, setReferenceAmountAddress] = useState<Address | undefined>()
  const [needsToAcceptHighPI, setNeedsToAcceptHighPI] = useState(false)
  const [acceptPoolRisks, setAcceptPoolRisks] = useState(false)
  const [wethIsEth, setWethIsEth] = useState(false)

  /* wantsProportional is true when:
    - the pool requires proportional input
    - the user selected the proportional tab
  */
  const [wantsProportional, setWantsProportional] = useState(requiresProportionalInput(pool))
  const { getNativeAssetToken, getWrappedNativeAssetToken, isLoadingTokenPrices } = useTokens()
  const { isConnected } = useUserAccount()
  const { hasValidationErrors } = useTokenInputsValidation()
  const { slippage } = useUserSettings()

  const handler = useMemo(
    () => selectAddLiquidityHandler(pool, wantsProportional),
    [pool, isLoading, wantsProportional]
  )

  /**
   * Helper functions & variables
   */
  const helpers = new LiquidityActionHelpers(pool)

  const chain = pool.chain
  const nativeAsset = getNativeAssetToken(chain)
  const wNativeAsset = getWrappedNativeAssetToken(chain)

  // All tokens that can be used in the pool form
  // standard tokens + wrapped/native asset (when wrapped native asset is present) + wrapped/underlying tokens (when the token is boosted)
  const validTokens = [
    ...injectNativeAsset(getPoolActionableTokens(pool), nativeAsset, pool),
    ...getWrappedBoostedTokens(pool),
  ]

  const { usdValueFor } = useTotalUsdValue(validTokens)

  function setInitialHumanAmountsIn() {
    setHumanAmountsIn(mapTokensToEmptyHumanAmounts(tokens))
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

  function clearAmountsIn(changedAmount?: HumanTokenAmountWithSymbol) {
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
  const totalUSDValue = isLoadingTokenPrices ? '0' : usdValueFor(humanAmountsIn)
  const { isMinimumDepositMet, errors: minimumDepositErrors } = useIsMinimumDepositMet({
    humanAmountsIn,
    totalUSDValue,
  })

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

  const disabledConditions: [boolean, string][] = [
    [!isConnected, LABELS.walletNotConnected],
    [
      areEmptyAmounts(humanAmountsIn),
      'You need to input one or more valid token amounts in the fields above',
    ],
    [!isMinimumDepositMet, 'Minimum deposit not met for the pool'],
    [hasValidationErrors, 'Fix the errors in token inputs'],
    [
      needsToAcceptHighPI,
      'To continue, accept high potential losses from this add transaction above',
    ],
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
    lastTransaction: transactionSteps.lastTransaction,
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
    isMinimumDepositMet,
    minimumDepositErrors,
  }
}

type Props = PropsWithChildren<{
  urlTxHash?: Hash
}>

export function AddLiquidityProvider({ urlTxHash, children }: Props) {
  const hook = useAddLiquidityLogic(urlTxHash)
  return <AddLiquidityContext.Provider value={hook}>{children}</AddLiquidityContext.Provider>
}

export const useAddLiquidity = (): UseAddLiquidityResponse =>
  useMandatoryContext(AddLiquidityContext, 'AddLiquidity')
