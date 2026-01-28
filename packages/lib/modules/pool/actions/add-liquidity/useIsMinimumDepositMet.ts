'use client'

import { HumanAmount, isSameAddress } from '@balancer/sdk'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useGetMinimumWrapAmount } from '@repo/lib/shared/hooks/useGetMinimumWrapAmount'
import { bn } from '@repo/lib/shared/utils/numbers'
import { Address, formatUnits, zeroAddress } from 'viem'
import { getCompositionTokens } from '../../pool-tokens.utils'
import { usePool } from '../../PoolProvider'
import { useGetMinimumTradeAmount } from '@repo/lib/shared/hooks/useGetMinimumTradeAmount'
import { PoolToken } from '../../pool.types'

type Props = { humanAmountsIn: HumanTokenAmountWithSymbol[]; totalUSDValue: string }
export type MinimumDepositErrors = Record<string, BigNumber>

// The contracts have limits for the minimum amount that can be traded and
// wrapped (in the case of boosted tokens)
export function useIsMinimumDepositMet({ humanAmountsIn, totalUSDValue }: Props) {
  const { chain, pool } = usePool()
  const { usdValueForTokenAddress, calcWeightForBalance, calcTotalUsdValue, priceFor } = useTokens()
  const { minimumWrapAmount } = useGetMinimumWrapAmount(chain)
  const { minimumTradeAmount } = useGetMinimumTradeAmount(chain)

  if (bn(totalUSDValue).isZero()) return { isMinimumDepositMet: true, errors: {} }

  const compositionTokens = getCompositionTokens(pool)
  const totalPoolLiquidity = calcTotalUsdValue(compositionTokens, pool.chain)

  const errors: MinimumDepositErrors = {}

  const BPT_DECIMALS = 18
  const minBptAmount = addBuffer(formatUnits(minimumTradeAmount, BPT_DECIMALS))
  const minBptAmountInDollars = usdValueForTokenAddress(pool.address, pool.chain, minBptAmount)
  const isBptEnough = bn(totalUSDValue).gte(minBptAmountInDollars)
  if (!isBptEnough) errors['BPT'] = round(minBptAmount, BPT_DECIMALS)

  const individualAmountErrors = humanAmountsIn.reduce((prev, amount) => {
    if (amount.humanAmount === '' || bn(amount.humanAmount).isZero()) return prev

    const token = findToken(compositionTokens, amount.tokenAddress)
    if (!token) return prev

    if (
      token.underlyingToken &&
      isSameAddress((token.underlyingToken?.address || zeroAddress) as Address, amount.tokenAddress)
    ) {
      const underlying = token.underlyingToken

      const minUnderlyingTradeAmount = addBuffer(
        formatUnits(minimumWrapAmount, underlying.decimals)
      )
      if (bn(amount.humanAmount).lt(minUnderlyingTradeAmount)) {
        prev[underlying.symbol] = round(minUnderlyingTradeAmount, underlying.decimals)
      }

      // We have an underlying token that will have to be wrapped
      // (checking amounts before and after the wrap)
      let minWrapAmount = addBuffer(formatUnits(minimumWrapAmount, underlying.decimals))
      if (bn(amount.humanAmount).lt(minWrapAmount)) {
        prev[underlying.symbol] = round(minWrapAmount, underlying.decimals)
      }

      const wrapperAmount = bn(amount.humanAmount).div(token.priceRate)
      minWrapAmount = addBuffer(formatUnits(minimumWrapAmount, token.decimals))
      if (bn(wrapperAmount).lt(minWrapAmount)) {
        const minUnderlyingAmount = bn(minWrapAmount).times(token.priceRate)
        if (minUnderlyingAmount.gt(prev[underlying.symbol] || 0)) {
          prev[underlying.symbol] = round(minUnderlyingAmount, underlying.decimals)
        }
      }
    } else {
      const minTradeAmount = addBuffer(formatUnits(minimumWrapAmount, token.decimals))
      if (bn(amount.humanAmount).lt(minTradeAmount)) {
        prev[token.symbol] = round(minTradeAmount, token.decimals)
      }
    }

    return prev
  }, {} as MinimumDepositErrors)

  // We have a second artificial limit that comes from how the price impact is
  // calculated. As a remove liquidity is used, it could happen that when adding
  // liquidity on the flexible tab a token with a small amount would cause problems
  // when removing liquidity (the amount to obtain will be total * weight and that
  // could be smaller than the trade limit)
  const priceImpactErrors = humanAmountsIn.reduce((prev, amount) => {
    const token = findToken(compositionTokens, amount.tokenAddress)
    if (!token) return prev

    let address = token.address
    let balance = token.balance
    let decimals = token.decimals

    if (
      token.underlyingToken &&
      isSameAddress((token.underlyingToken?.address || zeroAddress) as Address, amount.tokenAddress)
    ) {
      address = token.underlyingToken.address
      balance = bn(token.balance).div(token.priceRate).toString()
      decimals = token.underlyingToken.decimals
    }

    const minTradeAmount = addBuffer(formatUnits(minimumWrapAmount, decimals))

    const weight = calcWeightForBalance(address, balance, totalPoolLiquidity, chain)
    const tokenShareInDollars = bn(totalUSDValue).times(weight)
    const tokenPrice = priceFor(amount.tokenAddress, pool.chain)
    const tokenShare = tokenShareInDollars.div(tokenPrice)
    if (tokenShare.lte(minTradeAmount)) {
      const minTotalUSD = minTradeAmount.times(tokenPrice).div(weight)
      if (minTotalUSD.gt(prev['PriceImpact'] ? prev['PriceImpact'] : 0)) {
        prev['PriceImpact'] = round(minTotalUSD, 6)
      }
    }

    return prev
  }, {} as MinimumDepositErrors)

  return {
    isMinimumDepositMet:
      isBptEnough &&
      Object.keys(individualAmountErrors).length === 0 &&
      Object.keys(priceImpactErrors).length === 0,
    errors: { ...errors, ...individualAmountErrors, ...priceImpactErrors } as MinimumDepositErrors,
  }
}

function findToken(tokens: PoolToken[], address: Address) {
  return tokens.find(token => {
    return (
      isSameAddress(token.address as Address, address) ||
      isSameAddress((token.underlyingToken?.address || zeroAddress) as Address, address)
    )
  })
}

// When calculating mins on the contracts they add and remove wei's so
// numbers are rounded in a way that makes it more difficult to exploit
// this can give bigger min amounts that the calculated here. The solution
// for that is to add some buffer to our calculations
const BUFFER_MULTIPLIER = 1.01
function addBuffer(n: HumanAmount) {
  return bn(n).times(BUFFER_MULTIPLIER)
}

function round(n: BigNumber, decimals: number) {
  return bn(n.toFixed(decimals))
}
