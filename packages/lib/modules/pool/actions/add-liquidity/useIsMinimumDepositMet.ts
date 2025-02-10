/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { isSameAddress } from '@balancer/sdk'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useGetMinimumWrapAmount } from '@repo/lib/shared/hooks/useGetMinimumWrapAmount'
import { bn } from '@repo/lib/shared/utils/numbers' /* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react'
import { Address, formatUnits } from 'viem'
import { getCompositionTokens } from '../../pool-tokens.utils'
import { isBoosted } from '../../pool.helpers'
import { usePool } from '../../PoolProvider'

type Props = { humanAmountsIn: HumanTokenAmountWithAddress[]; totalUSDValue: string }
export function useIsMinimumDepositMet({ humanAmountsIn, totalUSDValue }: Props) {
  const { chain, pool } = usePool()
  const { usdValueForToken, calcTotalUsdValue, calcWeightForBalance } = useTokens()

  const { minimumWrapAmount } = useGetMinimumWrapAmount(chain)

  const compositionTokens = getCompositionTokens(pool)
  const totalLiquidity = calcTotalUsdValue(compositionTokens, chain)

  const weights = compositionTokens.map(poolToken => {
    return calcWeightForBalance(poolToken.address, poolToken.balance, totalLiquidity, chain)
  })

  // get the minimum bpt amount in usd for the minimum wrap amount and weights
  // sorted so highest amount is first in the array
  const minBptUsd = compositionTokens
    .map((token, index) => {
      if (!token.underlyingToken) return { amount: '0', token }

      const minimumWrapAmountFormatted = formatUnits(minimumWrapAmount, token.decimals)
      const minimumDepositAmount = bn(minimumWrapAmountFormatted).times(token.priceRate).toString()
      const minimumDepositAmountUsd = usdValueForToken(token, minimumDepositAmount)

      return { amount: bn(minimumDepositAmountUsd).div(weights[index]).toString(), token }
    })
    .sort((a, b) => (bn(a.amount).lt(bn(b.amount)) ? -1 : bn(a.amount).gt(bn(b.amount)) ? 1 : 0))
    .reverse()

  const isMinimumDepositMet = useMemo(() => {
    if (!isBoosted(pool)) return true

    // check if the amount is either higher than the minimum deposit amount or is empty
    const amountsValid = humanAmountsIn.map(amount => {
      const token = compositionTokens.find(token => {
        const address = token.underlyingToken ? token.underlyingToken.address : token.address
        return isSameAddress(address as Address, amount.tokenAddress)
      })

      const minimumWrapAmountFormatted = formatUnits(minimumWrapAmount, token?.decimals || 18)
      const minimumDepositAmount = bn(minimumWrapAmountFormatted)
        .times(token?.priceRate || '1')
        .toString()

      return bn(amount.humanAmount).gte(minimumDepositAmount) || amount.humanAmount === ''
    })

    // check total deposit amounts in usd against the highest minimum bpt amount and all deposit amounts are valid
    return bn(totalUSDValue).gt(bn(minBptUsd[0].amount)) && amountsValid.every(Boolean)
  }, [humanAmountsIn, totalUSDValue])

  return isMinimumDepositMet
}
