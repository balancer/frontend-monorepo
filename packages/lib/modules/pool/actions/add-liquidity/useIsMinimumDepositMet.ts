'use client'

import { isSameAddress } from '@balancer/sdk'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useGetMinimumWrapAmount } from '@repo/lib/shared/hooks/useGetMinimumWrapAmount'
import { bn } from '@repo/lib/shared/utils/numbers'
import { Address, formatUnits, zeroAddress } from 'viem'
import { getCompositionTokens } from '../../pool-tokens.utils'
import { isBoosted } from '../../pool.helpers'
import { usePool } from '../../PoolProvider'
import { useGetMinimumTradeAmount } from '@repo/lib/shared/hooks/useGetMinimumTradeAmount'
import { PoolToken } from '../../pool.types'

type Props = { humanAmountsIn: HumanTokenAmountWithAddress[]; totalUSDValue: string }

// The contracts have limits for the minimum amount that can be traded and
// wrapped (in the case of boosted tokens)
export function useIsMinimumDepositMet({ humanAmountsIn, totalUSDValue }: Props) {
  const { chain, pool } = usePool()
  const { usdValueForTokenAddress, calcWeightForBalance, calcTotalUsdValue, priceFor } = useTokens()
  const { minimumWrapAmount } = useGetMinimumWrapAmount(chain)
  const { minimumTradeAmount } = useGetMinimumTradeAmount(chain)

  if (!isBoosted(pool)) return true

  const compositionTokens = getCompositionTokens(pool)
  const totalPoolLiquidity = calcTotalUsdValue(compositionTokens, pool.chain)

  const minBptAmount = formatUnits(minimumTradeAmount, 18)
  const minBptAmountInDollars = usdValueForTokenAddress(pool.address, pool.chain, minBptAmount)
  const isBptEnough = bn(totalUSDValue).gte(minBptAmountInDollars)

  const areIndividualAmountsEnough = humanAmountsIn.reduce((prev, amount) => {
    if (amount.humanAmount === '' || bn(amount.humanAmount).isZero()) return prev

    const token = findToken(compositionTokens, amount.tokenAddress)
    if (!token) return prev

    if (
      token.underlyingToken &&
      isSameAddress((token.underlyingToken?.address || zeroAddress) as Address, amount.tokenAddress)
    ) {
      const minUnderlyingTradeAmount = formatUnits(
        minimumWrapAmount,
        token.underlyingToken.decimals
      )
      if (bn(amount.humanAmount).lte(minUnderlyingTradeAmount)) return false

      // We have an underlying token that will have to be wrapped
      // (checking amounts before and after the wrap)
      let minWrapAmount = formatUnits(minimumWrapAmount, token.underlyingToken.decimals)
      if (bn(amount.humanAmount).lte(minWrapAmount)) return false

      const wrapperAmount = bn(amount.humanAmount).div(token.priceRate)
      minWrapAmount = formatUnits(minimumWrapAmount, token.decimals)
      if (bn(wrapperAmount).lte(minWrapAmount)) return false
    } else {
      const minTradeAmount = formatUnits(minimumWrapAmount, token.decimals)
      if (bn(amount.humanAmount).lte(minTradeAmount)) return false
    }

    return prev
  }, true)

  // We have a second artificial limit that comes from how the price impact is
  // calculated. As a remove liquidity is used, it could happen that when adding
  // liquidity on the flexible tab a token with a small amount would cause problems
  // when removing liquidity (the amount to obtain will be total * weight and that
  // could be smaller than the trade limit)
  const canCalculatePriceImpact = humanAmountsIn.reduce((prev, amount) => {
    const token = findToken(compositionTokens, amount.tokenAddress)
    if (!token) return prev

    const minTradeAmount = formatUnits(minimumWrapAmount, token.decimals)

    const weight = calcWeightForBalance(token.address, token.balance, totalPoolLiquidity, chain)
    const tokenShareInDollars = bn(totalUSDValue).times(weight)
    const tokenShare = tokenShareInDollars.div(priceFor(amount.tokenAddress, pool.chain))
    if (tokenShare.lte(minTradeAmount)) return false

    return prev
  }, true)

  return isBptEnough && areIndividualAmountsEnough && canCalculatePriceImpact
}

function findToken(tokens: PoolToken[], address: Address) {
  return tokens.find(token => {
    return (
      isSameAddress(token.address as Address, address) ||
      isSameAddress((token.underlyingToken?.address || zeroAddress) as Address, address)
    )
  })
}
