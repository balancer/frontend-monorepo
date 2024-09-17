import { Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useSwap } from './SwapProvider'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { useTokens } from '../tokens/TokensProvider'
import { fNum } from '@/lib/shared/utils/numbers'

export function SwapRate() {
  const [priceDirection, setPriceDirection] = useState<'givenIn' | 'givenOut'>('givenIn')
  const { simulationQuery, tokenInInfo, tokenOutInfo } = useSwap()
  const { toCurrency } = useCurrency()
  const { usdValueForToken } = useTokens()

  const effectivePrice = fNum('token', simulationQuery.data?.effectivePrice || '0', {
    abbreviated: false,
  })
  const effectivePriceReversed = fNum(
    'token',
    simulationQuery.data?.effectivePriceReversed || '0',
    { abbreviated: false }
  )

  const tokenInUsdValue = usdValueForToken(tokenInInfo, 1)
  const tokenOutUsdValue = usdValueForToken(tokenOutInfo, 1)

  const priceLabel =
    priceDirection === 'givenIn'
      ? `1 ${tokenInInfo?.symbol} = ${effectivePriceReversed} ${tokenOutInfo?.symbol} (${toCurrency(
          tokenInUsdValue,
          { abbreviated: false }
        )})`
      : `1 ${tokenOutInfo?.symbol} = ${effectivePrice} ${tokenInInfo?.symbol} (${toCurrency(
          tokenOutUsdValue,
          { abbreviated: false }
        )})`

  const togglePriceDirection = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    setPriceDirection(priceDirection === 'givenIn' ? 'givenOut' : 'givenIn')
  }

  return (
    <Text variant="secondary" fontSize="sm" cursor="pointer" onClick={togglePriceDirection}>
      {simulationQuery.data && priceLabel}
    </Text>
  )
}
