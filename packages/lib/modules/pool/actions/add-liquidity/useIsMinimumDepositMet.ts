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

type Props = { humanAmountsIn: HumanTokenAmountWithAddress[]; totalUSDValue: string }

export function useIsMinimumDepositMet({ humanAmountsIn, totalUSDValue }: Props) {
  const { chain, pool } = usePool()
  const { usdValueForTokenAddress } = useTokens()
  const { minimumWrapAmount } = useGetMinimumWrapAmount(chain)
  const { minimumTradeAmount } = useGetMinimumTradeAmount(chain)

  if (!isBoosted(pool)) return true

  const compositionTokens = getCompositionTokens(pool)

  const minBptAmount = formatUnits(minimumTradeAmount, 18)
  const minBptAmountInDollars = usdValueForTokenAddress(pool.address, pool.chain, minBptAmount)
  const isBptEnough = bn(totalUSDValue).gt(minBptAmountInDollars)

  const areIndividualAmountsEnough = humanAmountsIn.reduce((prev, amount) => {
    if (amount.humanAmount === '' || bn(amount.humanAmount).isZero()) return prev

    const token = compositionTokens.find(token => {
      return (
        isSameAddress(token.address as Address, amount.tokenAddress) ||
        isSameAddress(
          (token.underlyingToken?.address || zeroAddress) as Address,
          amount.tokenAddress
        )
      )
    })
    if (!token) return prev

    if (
      token.underlyingToken &&
      isSameAddress((token.underlyingToken?.address || zeroAddress) as Address, amount.tokenAddress)
    ) {
      const minTradeAmount = formatUnits(minimumWrapAmount, token.underlyingToken.decimals)
      if (bn(amount.humanAmount).lt(minTradeAmount)) return false

      // We have an underlying token that will have to be wrapped
      // (checking amounts before and after the wrap)
      let minWrapAmount = formatUnits(minimumWrapAmount, token.underlyingToken.decimals)
      if (bn(amount.humanAmount).lt(minWrapAmount)) return false

      const wrapperAmount = bn(amount.humanAmount).div(token.priceRate)
      minWrapAmount = formatUnits(minimumWrapAmount, token.decimals)
      if (bn(wrapperAmount).lt(minWrapAmount)) return false
    } else {
      const minTradeAmount = formatUnits(minimumWrapAmount, token.decimals)
      if (bn(amount.humanAmount).lt(minTradeAmount)) return false
    }

    return prev
  }, true)

  return isBptEnough && areIndividualAmountsEnough
}
