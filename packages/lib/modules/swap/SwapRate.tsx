import { Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useSwap } from './SwapProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useTokens } from '../tokens/TokensProvider'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { GqlSorSwapType } from '@repo/lib/shared/services/api/generated/graphql'

export function SwapRate() {
  const [priceDirection, setPriceDirection] = useState<'givenIn' | 'givenOut'>('givenIn')
  const { simulationQuery, tokenInInfo, tokenOutInfo, isLbpSwap, lbpTokenOut } = useSwap()
  const { toCurrency } = useCurrency()
  const { usdValueForToken } = useTokens()

  const effectivePriceValue = fNum('token', simulationQuery.data?.effectivePrice || '0', {
    abbreviated: false,
  })

  const effectivePriceReversedValue = fNum(
    'token',
    simulationQuery.data?.effectivePriceReversed || '0',
    { abbreviated: false }
  )

  const effectivePrice =
    simulationQuery.data?.swapType === GqlSorSwapType.ExactIn
      ? effectivePriceValue
      : effectivePriceReversedValue

  const effectivePriceReversed =
    simulationQuery.data?.swapType === GqlSorSwapType.ExactIn
      ? effectivePriceReversedValue
      : effectivePriceValue

  const tokenInUsdValue = usdValueForToken(tokenInInfo, 1)
  const tokenOutUsdValue = usdValueForToken(tokenOutInfo, 1)
  const tokenOutSymbol = isLbpSwap && lbpTokenOut ? lbpTokenOut.symbol : tokenOutInfo?.symbol

  const priceLabel =
    priceDirection === 'givenIn'
      ? `1 ${tokenInInfo?.symbol} = ${effectivePriceReversed} ${tokenOutSymbol} (${toCurrency(
          tokenInUsdValue,
          { abbreviated: false }
        )})`
      : `1 ${tokenOutSymbol} = ${effectivePrice} ${tokenInInfo?.symbol} (${toCurrency(
          tokenOutUsdValue,
          { abbreviated: false }
        )})`

  const togglePriceDirection = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    setPriceDirection(priceDirection === 'givenIn' ? 'givenOut' : 'givenIn')
  }

  return (
    <Text cursor="pointer" fontSize="sm" onClick={togglePriceDirection} variant="secondary">
      {simulationQuery.data ? priceLabel : 'Exchange rate: –'}
    </Text>
  )
}
