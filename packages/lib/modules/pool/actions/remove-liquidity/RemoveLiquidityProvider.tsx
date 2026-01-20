'use client'

import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { LABELS } from '@repo/lib/shared/labels'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { isDisabledWithReason } from '@repo/lib/shared/utils/functions/isDisabledWithReason'
import { bn, isTooSmallToRemoveUsd, isZero, safeSum } from '@repo/lib/shared/utils/numbers'
import { HumanAmount, TokenAmount, isSameAddress } from '@balancer/sdk'
import { PropsWithChildren, createContext, useMemo, useState } from 'react'
import { usePool } from '../../PoolProvider'
import { selectRemoveLiquidityHandler } from './handlers/selectRemoveLiquidityHandler'
import { RemoveLiquidityHandler } from './handlers/RemoveLiquidity.handler'
import { Pool } from '../../pool.types'
import { useRemoveLiquidityPriceImpactQuery } from './queries/useRemoveLiquidityPriceImpactQuery'
import { RemoveLiquidityType } from './remove-liquidity.types'
import { Address, formatUnits, Hash } from 'viem'
import { emptyTokenAmounts, toHumanAmountWithAddress } from '../LiquidityActionHelpers'
import { isCowAmmPool } from '../../pool.helpers'
import { getActionableTokenAddresses, getPoolActionableTokens } from '../../pool-tokens.utils'
import { isWrappedNativeAsset } from '@repo/lib/modules/tokens/token.helpers'
import { useRemoveLiquiditySimulationQuery } from './queries/useRemoveLiquiditySimulationQuery'
import { useRemoveLiquiditySteps } from './useRemoveLiquiditySteps'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { getUserWalletBalance } from '../../user-balance.helpers'
import { useModalWithPoolRedirect } from '../../useModalWithPoolRedirect'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { useWrapUnderlying } from '../useWrapUnderlying'

export type UseRemoveLiquidityResponse = ReturnType<typeof useRemoveLiquidityLogic>
export const RemoveLiquidityContext = createContext<UseRemoveLiquidityResponse | null>(null)

export function useRemoveLiquidityLogic(
  urlTxHash?: Hash,
  mute?: boolean,
  handlerSelector?: (pool: Pool, removalType: RemoveLiquidityType) => RemoveLiquidityHandler,
  maxHumanBptIn?: HumanAmount,
  customStepsHook?: typeof useRemoveLiquiditySteps
) {
  const [singleTokenAddress, setSingleTokenAddress] = useState<Address | undefined>(undefined)
  const [humanBptInPercent, setHumanBptInPercent] = useState<number>(100)
  const [wethIsEth, setWethIsEth] = useState(false)
  const [needsToAcceptHighPI, setNeedsToAcceptHighPI] = useState(false)
  const [removalType, setRemovalType] = useState<RemoveLiquidityType>(
    RemoveLiquidityType.Proportional
  )

  const { pool, chainId, bptPrice, isLoading } = usePool()
  const { getNativeAssetToken, getWrappedNativeAssetToken, usdValueForTokenAddress } = useTokens()
  const { isConnected } = useUserAccount()
  const { wrapUnderlying, setWrapUnderlyingByIndex } = useWrapUnderlying(pool)

  const _maxHumanBptIn: HumanAmount = maxHumanBptIn ?? getUserWalletBalance(pool)
  const humanBptIn: HumanAmount = bn(_maxHumanBptIn)
    .times(humanBptInPercent / 100)
    .toFixed() as HumanAmount

  const tokens = getPoolActionableTokens(pool, wrapUnderlying)

  const chain = pool.chain
  const nativeAsset = getNativeAssetToken(chain)
  const wNativeAsset = getWrappedNativeAssetToken(chain)
  const includesWrappedNativeAsset: boolean = tokens.some(token =>
    isWrappedNativeAsset(token.address as Address, chain)
  )

  const handler = useMemo(() => {
    const selector = handlerSelector ?? selectRemoveLiquidityHandler
    return selector(pool, removalType)
  }, [pool, removalType, isLoading, handlerSelector])

  const totalUsdFromBprPrice = bn(humanBptIn).times(bptPrice).toFixed()

  const setProportionalType = () => setRemovalType(RemoveLiquidityType.Proportional)
  const setSingleTokenType = () => setRemovalType(RemoveLiquidityType.SingleToken)
  const isSingleToken = removalType === RemoveLiquidityType.SingleToken
  const isProportional = removalType === RemoveLiquidityType.Proportional

  function tokensToShow(): ApiToken[] {
    // Cow AMM pools don't support wethIsEth
    if (isCowAmmPool(pool.type)) return tokens

    // for single token we show both the native asset AND the wrapped native asset in the ui
    if (includesWrappedNativeAsset && isSingleToken && nativeAsset) return [...tokens, nativeAsset]

    // if wethIsEth we only show the native asset
    if (includesWrappedNativeAsset && wethIsEth) {
      // replace the wrapped native asset with the native asset
      return tokens
        .map(token => {
          if (token && isWrappedNativeAsset(token.address as Address, chain)) {
            return nativeAsset
          } else {
            return token
          }
        })
        .filter((token): token is ApiToken => token !== undefined)
    }

    return tokens
  }

  const validTokens = nativeAsset ? [nativeAsset, ...tokens] : tokens

  const firstTokenAddress = tokens?.[0]?.address as Address

  const singleTokenOutAddress = singleTokenAddress || firstTokenAddress

  const tokenOut =
    wethIsEth && wNativeAsset ? (wNativeAsset.address as Address) : singleTokenOutAddress

  const isSingleTokenBalanceMoreThat25Percent = useMemo(() => {
    const walletBalance = pool.userBalance?.walletBalance
    const totalShares = pool.dynamicData.totalShares

    if (!walletBalance || !isSingleToken) {
      return false
    }

    return bn(walletBalance).times(bn(humanBptInPercent).div(100)).gt(bn(totalShares).times(0.25))
  }, [humanBptInPercent, isSingleToken, pool])

  /**
   * Queries
   */

  const usdValueForHumanBptIn = usdValueForTokenAddress(pool.address, chain, humanBptIn)

  const enabled =
    !urlTxHash &&
    !!tokenOut &&
    !isSingleTokenBalanceMoreThat25Percent &&
    !isTooSmallToRemoveUsd(usdValueForHumanBptIn)

  const simulationQuery = useRemoveLiquiditySimulationQuery({
    handler,
    chainId,
    humanBptIn,
    tokenOut,
    tokensOut: getActionableTokenAddresses(pool, wrapUnderlying),
    enabled,
  })

  const priceImpactQuery = useRemoveLiquidityPriceImpactQuery({
    handler,
    chainId,
    humanBptIn,
    tokenOut,
    enabled,
  })

  /**
   * Step construction
   */
  const stepsHook = customStepsHook || useRemoveLiquiditySteps
  const steps = stepsHook({
    handler,
    simulationQuery,
    humanBptIn,
    wethIsEth,
    singleTokenOutAddress,
  })
  const transactionSteps = useTransactionSteps(steps, false, mute)

  const removeLiquidityTxHash =
    urlTxHash || transactionSteps.lastTransaction?.result?.data?.transactionHash
  const removeLiquidityTxSuccess = transactionSteps.lastTransactionConfirmed

  const hasQuoteContext = !!simulationQuery.data

  const quoteAmountsOut = simulationQuery.data?.amountsOut || emptyTokenAmounts(tokens)
  const quotePriceImpact = priceImpactQuery.data

  /**
   * Methods
   */
  const amountOutForToken = (tokenAddress: Address): HumanAmount => {
    const amountOut = amountOutMap[tokenAddress]
    return amountOut ? (amountOut.humanAmount as HumanAmount) : '0'
  }

  const usdOutForToken = (tokenAddress: Address): HumanAmount => {
    const usdOut = usdAmountOutMap[tokenAddress]
    return usdOut ? usdOut : '0'
  }

  // If wethIsEth is true, we need to return the native asset address for the token amount
  function getAddressForTokenAmount(tokenAmount: TokenAmount): Address {
    return wethIsEth &&
      wNativeAsset &&
      nativeAsset &&
      isSameAddress(tokenAmount.token.address, wNativeAsset.address as Address)
      ? (nativeAsset.address as Address)
      : tokenAmount.token.address
  }

  /**
   * Derived state
   */
  const amountOutMap: Record<Address, HumanTokenAmountWithSymbol> = Object.fromEntries(
    quoteAmountsOut.map(tokenAmount => [
      getAddressForTokenAmount(tokenAmount),
      toHumanAmountWithAddress(tokenAmount),
    ])
  )

  const amountsOut: HumanTokenAmountWithSymbol[] = quoteAmountsOut.map(tokenAmount => ({
    tokenAddress: getAddressForTokenAmount(tokenAmount),
    humanAmount: formatUnits(tokenAmount.amount, tokenAmount.token.decimals),
    symbol: tokenAmount.token.symbol || 'Unknown',
  }))

  const usdAmountOutMap: Record<Address, HumanAmount> = Object.fromEntries(
    quoteAmountsOut.map(tokenAmount => {
      const tokenAddress = getAddressForTokenAmount(tokenAmount)
      const tokenUnits = amountOutForToken(tokenAddress)

      if (tokenAddress === pool.address) return [tokenAddress, '0'] // Ignore BPT token addresses included in SDK amountsOut

      return [
        tokenAddress,
        usdValueForTokenAddress(tokenAddress, pool.chain, tokenUnits) as HumanAmount,
      ]
    })
  )

  // while the single token balance is more than 25% of the pool, we use the wallet balance usd for the view
  const totalUSDValue = isSingleTokenBalanceMoreThat25Percent
    ? bn(pool.userBalance?.walletBalanceUsd || '0')
        .times(bn(humanBptInPercent).div(100))
        .toString()
    : safeSum(Object.values(usdAmountOutMap))

  const totalAmountsOut: string = safeSum(quoteAmountsOut.map(a => a.amount))

  const { isDisabled, disabledReason } = isDisabledWithReason(
    [!isConnected, LABELS.walletNotConnected],
    [Number(humanBptIn) === 0, 'You must specify a valid bpt in'],
    [isZero(totalAmountsOut), 'Amount to remove cannot be zero'],
    [
      needsToAcceptHighPI,
      'To continue, accept high potential losses from this remove transaction above',
    ],
    [simulationQuery.isLoading, 'Fetching quote...'],
    [simulationQuery.isError, 'Error fetching quote'],
    [priceImpactQuery.isLoading, 'Fetching price impact...'],
    [priceImpactQuery.isError, 'Error fetching price impact']
  )

  const previewModalDisclosure = useModalWithPoolRedirect(pool, removeLiquidityTxHash)

  return {
    transactionSteps,
    lastTransaction: transactionSteps.lastTransaction,
    tokens: tokensToShow(),
    validTokens,
    singleTokenOutAddress,
    humanBptIn,
    humanBptInPercent,
    quotePriceImpact,
    totalUsdFromBprPrice,
    isSingleToken,
    isProportional,
    totalUSDValue,
    simulationQuery,
    priceImpactQuery,
    isDisabled,
    disabledReason,
    previewModalDisclosure,
    handler,
    wethIsEth,
    wrapUnderlying,
    urlTxHash,
    removeLiquidityTxHash,
    hasQuoteContext,
    amountsOut,
    removeLiquidityTxSuccess,
    isSingleTokenBalanceMoreThat25Percent,
    setRemovalType,
    setHumanBptInPercent,
    setProportionalType,
    setSingleTokenType,
    setSingleTokenAddress,
    amountOutForToken,
    usdOutForToken,
    setNeedsToAcceptHighPI,
    setWethIsEth,
    setWrapUnderlyingByIndex,
  }
}

type Props = PropsWithChildren<{
  urlTxHash?: Hash
  mute?: boolean
  handlerSelector?: (pool: Pool, removalType: RemoveLiquidityType) => RemoveLiquidityHandler
  maxHumanBptIn?: HumanAmount
  customStepsHook?: typeof useRemoveLiquiditySteps
}>

export function RemoveLiquidityProvider({
  urlTxHash,
  mute,
  handlerSelector,
  maxHumanBptIn,
  customStepsHook,
  children,
}: Props) {
  const hook = useRemoveLiquidityLogic(
    urlTxHash,
    mute,
    handlerSelector,
    maxHumanBptIn,
    customStepsHook
  )
  return <RemoveLiquidityContext.Provider value={hook}>{children}</RemoveLiquidityContext.Provider>
}

export const useRemoveLiquidity = (): UseRemoveLiquidityResponse =>
  useMandatoryContext(RemoveLiquidityContext, 'RemoveLiquidity')
