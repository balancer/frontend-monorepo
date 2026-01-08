'use client'

import { isSameAddress } from '@balancer/sdk'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useGetMinimumWrapAmount } from '@repo/lib/shared/hooks/useGetMinimumWrapAmount'
import { bn } from '@repo/lib/shared/utils/numbers'
import { Address, formatUnits, zeroAddress } from 'viem'
import { getCompositionTokens } from '../../pool-tokens.utils'
import { usePool } from '../../PoolProvider'
import { useGetMinimumTradeAmount } from '@repo/lib/shared/hooks/useGetMinimumTradeAmount'
import { PoolToken } from '../../pool.types'

type Props = { humanAmountsIn: HumanTokenAmountWithAddress[]; totalUSDValue: string }
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

  const minBptAmount = formatUnits(minimumTradeAmount, 18)
  const minBptAmountInDollars = usdValueForTokenAddress(pool.address, pool.chain, minBptAmount)
  const isBptEnough = bn(totalUSDValue).gte(minBptAmountInDollars)
  if (!isBptEnough) errors['BPT'] = bn(minBptAmount)

  const individualAmountErrors = humanAmountsIn.reduce((prev, amount) => {
    if (amount.humanAmount === '' || bn(amount.humanAmount).isZero()) return prev

    const token = findToken(compositionTokens, amount.tokenAddress)
    if (!token) return prev

    if (
      token.underlyingToken &&
      isSameAddress((token.underlyingToken?.address || zeroAddress) as Address, amount.tokenAddress)
    ) {
      const underlying = token.underlyingToken

      const minUnderlyingTradeAmount = formatUnits(
        minimumWrapAmount,
        token.underlyingToken.decimals
      )
      if (bn(amount.humanAmount).lt(minUnderlyingTradeAmount)) {
        prev[underlying.symbol] = bn(minUnderlyingTradeAmount)
      }

      // We have an underlying token that will have to be wrapped
      // (checking amounts before and after the wrap)
      let minWrapAmount = formatUnits(minimumWrapAmount, underlying.decimals)
      if (bn(amount.humanAmount).lt(minWrapAmount)) {
        prev[underlying.symbol] = bn(minWrapAmount)
      }

      const wrapperAmount = bn(amount.humanAmount).div(token.priceRate)
      minWrapAmount = formatUnits(minimumWrapAmount, token.decimals)
      if (bn(wrapperAmount).lt(minWrapAmount)) {
        const minUnderlyingAmount = bn(minWrapAmount).times(token.priceRate)
        if (minUnderlyingAmount.gt(prev[underlying.symbol] || 0)) {
          prev[underlying.symbol] = bn(minUnderlyingAmount.toFixed(underlying.decimals))
        }
      }
    } else {
      const minTradeAmount = formatUnits(minimumWrapAmount, token.decimals)
      if (bn(amount.humanAmount).lt(minTradeAmount)) {
        prev[token.symbol] = bn(minTradeAmount)
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

    const minTradeAmount = formatUnits(minimumWrapAmount, decimals)

    const weight = calcWeightForBalance(address, balance, totalPoolLiquidity, chain)
    const tokenShareInDollars = bn(totalUSDValue).times(weight)
    const tokenPrice = priceFor(amount.tokenAddress, pool.chain)
    const tokenShare = tokenShareInDollars.div(tokenPrice)
    if (tokenShare.lte(minTradeAmount)) {
      const minTotalUSD = bn(minTradeAmount).times(tokenPrice).div(weight)
      if (minTotalUSD.gt(prev['PriceImpact'] ? prev['PriceImpact'] : 0)) {
        prev['PriceImpact'] = minTotalUSD
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
