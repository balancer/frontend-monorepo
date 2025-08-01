import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { safeSum } from '@repo/lib/shared/utils/numbers'
import { useCallback } from 'react'
import { HumanTokenAmount } from './token.types'
import { ApiToken } from './token.types'

export function useTotalUsdValue(tokens: ApiToken[]) {
  const { usdValueForTokenAddress } = useTokens()

  const calculateUsdAmountsIn = useCallback(
    (humanAmountsIn: HumanTokenAmount[]) =>
      humanAmountsIn.map(amountIn => {
        const token = tokens.find(token => isSameAddress(token?.address, amountIn.tokenAddress))

        if (!token) return '0'

        return usdValueForTokenAddress(token.address, token.chain, amountIn.humanAmount)
      }),
    [usdValueForTokenAddress, tokens]
  )

  function usdValueFor(humanAmountsIn: HumanTokenAmount[]) {
    return safeSum(calculateUsdAmountsIn(humanAmountsIn))
  }

  return { usdValueFor }
}
