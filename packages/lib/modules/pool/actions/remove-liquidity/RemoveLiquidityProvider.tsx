/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { HumanAmount, TokenAmount, isSameAddress } from '@balancer/sdk'
import { PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react'
import { usePool } from '../../PoolProvider'
import { selectRemoveLiquidityHandler } from './handlers/selectRemoveLiquidityHandler'
import { useRemoveLiquidityPriceImpactQuery } from './queries/useRemoveLiquidityPriceImpactQuery'
import { RemoveLiquidityType } from './remove-liquidity.types'
import { Address, Hash } from 'viem'
import { emptyTokenAmounts, supportsNestedActions, toHumanAmount } from '../LiquidityActionHelpers'
import { useDisclosure } from '@chakra-ui/hooks'
import { isCowAmmPool } from '../../pool.helpers'
import { useRemoveLiquiditySimulationQuery } from './queries/useRemoveLiquiditySimulationQuery'
import { useRemoveLiquiditySteps } from './useRemoveLiquiditySteps'
import { getUserWalletBalance } from '../../user-balance.helpers'
import { LABELS } from '../../../../shared/labels'
import { GqlToken } from '../../../../shared/services/api/generated/graphql'
import { useMandatoryContext } from '../../../../shared/utils/contexts'
import { isDisabledWithReason } from '../../../../shared/utils/functions/isDisabledWithReason'
import { bn, safeSum, isZero } from '../../../../shared/utils/numbers'
import { isWrappedNativeAsset, getLeafTokens } from '../../../tokens/token.helpers'
import { HumanTokenAmountWithAddress } from '../../../tokens/token.types'
import { useTokens } from '../../../tokens/TokensProvider'
import { useTransactionSteps } from '../../../transactions/transaction-steps/useTransactionSteps'
import { useUserAccount } from '../../../web3/UserAccountProvider'

export type UseRemoveLiquidityResponse = ReturnType<typeof _useRemoveLiquidity>
export const RemoveLiquidityContext = createContext<UseRemoveLiquidityResponse | null>(null)

export function _useRemoveLiquidity(urlTxHash?: Hash) {
  const [singleTokenAddress, setSingleTokenAddress] = useState<Address | undefined>(undefined)
  const [humanBptInPercent, setHumanBptInPercent] = useState<number>(100)
  const [wethIsEth, setWethIsEth] = useState(false)
  const [needsToAcceptHighPI, setNeedsToAcceptHighPI] = useState(false)
  const [removalType, setRemovalType] = useState<RemoveLiquidityType>(
    RemoveLiquidityType.Proportional,
  )

  // Quote state, fixed when remove liquidity tx goes into confirming/confirmed
  // state. This is required to maintain amounts in preview dialog on success.
  const [quoteBptIn, setQuoteBptIn] = useState<HumanAmount>('0')
  const [quoteAmountsOut, setQuoteAmountsOut] = useState<TokenAmount[]>([])
  const [quotePriceImpact, setQuotePriceImpact] = useState<number>()

  const { pool, chainId, bptPrice, isLoading } = usePool()
  const { getToken, usdValueForToken, getNativeAssetToken, getWrappedNativeAssetToken } =
    useTokens()
  const { isConnected } = useUserAccount()
  const previewModalDisclosure = useDisclosure()

  const maxHumanBptIn: HumanAmount = getUserWalletBalance(pool)
  const humanBptIn: HumanAmount = bn(maxHumanBptIn)
    .times(humanBptInPercent / 100)
    .toFixed() as HumanAmount

  const chain = pool.chain
  const nativeAsset = getNativeAssetToken(chain)
  const wNativeAsset = getWrappedNativeAssetToken(chain)
  const includesWrappedNativeAsset: boolean = getPoolTokens().some(token =>
    isWrappedNativeAsset(token.address as Address, chain),
  )

  const handler = useMemo(
    () => selectRemoveLiquidityHandler(pool, removalType),
    [pool.id, removalType, isLoading],
  )

  const totalUsdFromBprPrice = bn(humanBptIn).times(bptPrice).toFixed()

  const setProportionalType = () => setRemovalType(RemoveLiquidityType.Proportional)
  const setSingleTokenType = () => setRemovalType(RemoveLiquidityType.SingleToken)
  const isSingleToken = removalType === RemoveLiquidityType.SingleToken
  const isProportional = removalType === RemoveLiquidityType.Proportional

  function getPoolTokens() {
    // TODO add exception for composable pools where we can allow adding
    // liquidity with nested tokens
    if (supportsNestedActions(pool)) return getLeafTokens(pool.poolTokens)

    return pool.poolTokens
  }

  const tokens = getPoolTokens().map(token => getToken(token.address, pool.chain))

  function tokensToShow() {
    // Cow AMM pools don't support wethIsEth
    if (isCowAmmPool(pool.type)) return tokens

    // for single token we show both the native asset AND the wrapped native asset in the ui
    if (includesWrappedNativeAsset && isSingleToken && nativeAsset) return [...tokens, nativeAsset]

    // if wethIsEth we only show the native asset
    if (includesWrappedNativeAsset && wethIsEth) {
      // replace the wrapped native asset with the native asset
      return tokens.map(token => {
        if (token && isWrappedNativeAsset(token.address as Address, chain)) {
          return nativeAsset
        } else {
          return token
        }
      })
    }

    return tokens
  }

  let validTokens = tokens.filter((token): token is GqlToken => !!token)
  validTokens = nativeAsset ? [nativeAsset, ...validTokens] : validTokens

  const firstTokenAddress = tokens?.[0]?.address as Address

  const singleTokenOutAddress = singleTokenAddress || firstTokenAddress

  const tokenOut =
    wethIsEth && wNativeAsset ? (wNativeAsset.address as Address) : singleTokenOutAddress

  /**
   * Queries
   */
  const simulationQuery = useRemoveLiquiditySimulationQuery({
    handler,
    poolId: pool.id,
    chainId,
    humanBptIn,
    tokenOut,
    enabled: !urlTxHash && !!tokenOut,
  })

  const priceImpactQuery = useRemoveLiquidityPriceImpactQuery({
    handler,
    poolId: pool.id,
    chainId,
    humanBptIn,
    tokenOut,
    enabled: !urlTxHash && !!tokenOut,
  })

  /**
   * Step construction
   */
  const steps = useRemoveLiquiditySteps({
    handler,
    simulationQuery,
    humanBptIn,
    wethIsEth,
    singleTokenOutAddress,
  })
  const transactionSteps = useTransactionSteps(steps)

  const removeLiquidityTxHash =
    urlTxHash || transactionSteps.lastTransaction?.result?.data?.transactionHash
  const removeLiquidityTxSuccess = transactionSteps.lastTransactionConfirmed

  const hasQuoteContext = !!simulationQuery.data

  /**
   * Methods
   */
  const amountOutForToken = (tokenAddress: Address): HumanAmount => {
    const amountOut = amountOutMap[tokenAddress]
    return amountOut ? amountOut : '0'
  }

  const usdOutForToken = (tokenAddress: Address): HumanAmount => {
    const usdOut = usdAmountOutMap[tokenAddress]
    return usdOut ? usdOut : '0'
  }

  function updateQuoteState(
    bptIn: HumanAmount,
    amountsOut: TokenAmount[] | undefined,
    priceImpact: number | undefined,
  ) {
    setQuoteBptIn(bptIn)
    if (!amountsOut) setQuoteAmountsOut(emptyTokenAmounts(pool))
    if (amountsOut) setQuoteAmountsOut(amountsOut)
    if (priceImpact) setQuotePriceImpact(priceImpact)
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
  const amountOutMap: Record<Address, HumanAmount> = Object.fromEntries(
    quoteAmountsOut.map(tokenAmount => [
      getAddressForTokenAmount(tokenAmount),
      toHumanAmount(tokenAmount),
    ]),
  )

  const amountsOut: HumanTokenAmountWithAddress[] = Object.entries(amountOutMap).map(
    ([address, amount]) => ({ tokenAddress: address as Address, humanAmount: amount }),
  )

  const usdAmountOutMap: Record<Address, HumanAmount> = Object.fromEntries(
    quoteAmountsOut.map(tokenAmount => {
      const tokenAddress = getAddressForTokenAmount(tokenAmount)
      const token = getToken(tokenAddress, pool.chain)
      if (!token) return [tokenAddress, '0'] // Ignore BPT token addresses included in SDK amountsOut

      const tokenUnits = amountOutForToken(token.address as Address)

      return [tokenAddress, usdValueForToken(token, tokenUnits) as HumanAmount]
    }),
  )

  const totalUSDValue: string = safeSum(Object.values(usdAmountOutMap))
  const totalAmountsOut: string = safeSum(quoteAmountsOut.map(a => a.amount))

  const { isDisabled, disabledReason } = isDisabledWithReason(
    [!isConnected, LABELS.walletNotConnected],
    [Number(humanBptIn) === 0, 'You must specify a valid bpt in'],
    [isZero(totalAmountsOut), 'Amount to remove cannot be zero'],
    [needsToAcceptHighPI, 'Accept high price impact first'],
    [simulationQuery.isLoading, 'Fetching quote...'],
    [simulationQuery.isError, 'Error fetching quote'],
    [priceImpactQuery.isLoading, 'Fetching price impact...'],
    [priceImpactQuery.isError, 'Error fetching price impact'],
  )

  /**
   * Side-effects
   */
  // If amounts change, update quote state unless the final transaction is
  // confirming or confirmed.
  useEffect(() => {
    if (!transactionSteps.lastTransactionConfirmingOrConfirmed) {
      updateQuoteState(humanBptIn, simulationQuery.data?.amountsOut, priceImpactQuery.data)
    }
  }, [
    humanBptIn,
    simulationQuery.data,
    priceImpactQuery.data,
    transactionSteps.lastTransactionState,
  ])

  return {
    transactionSteps,
    tokens: tokensToShow(),
    validTokens,
    singleTokenOutAddress,
    humanBptIn,
    humanBptInPercent,
    quoteBptIn,
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
    removeLiquidityTxHash,
    hasQuoteContext,
    amountsOut,
    removeLiquidityTxSuccess,
    setRemovalType,
    setHumanBptInPercent,
    setProportionalType,
    setSingleTokenType,
    setSingleTokenAddress,
    amountOutForToken,
    usdOutForToken,
    setNeedsToAcceptHighPI,
    setWethIsEth,
    updateQuoteState,
  }
}

type Props = PropsWithChildren<{ urlTxHash?: Hash }>

export function RemoveLiquidityProvider({ urlTxHash, children }: Props) {
  const hook = _useRemoveLiquidity(urlTxHash)
  return <RemoveLiquidityContext.Provider value={hook}>{children}</RemoveLiquidityContext.Provider>
}

export const useRemoveLiquidity = (): UseRemoveLiquidityResponse =>
  useMandatoryContext(RemoveLiquidityContext, 'RemoveLiquidity')