import { Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useSwap } from './SwapProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useTokens } from '../tokens/TokensProvider'
import { fNum, bn } from '@repo/lib/shared/utils/numbers'
import { GqlSorSwapType } from '@repo/lib/shared/services/api/generated/graphql'

export function SwapRate({
  customTokenUsdPrice,
  isLbpSwap,
}: {
  customTokenUsdPrice?: number
  isLbpSwap: boolean
}) {
  const [priceDirection, setPriceDirection] = useState<'givenIn' | 'givenOut'>('givenIn')
  const { simulationQuery, tokenInInfo, tokenOutInfo } = useSwap()
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

  const tokenInUsdValue = tokenOutInfo ? usdValueForToken(tokenInInfo, 1) : customTokenUsdPrice
  const tokenOutUsdValue = tokenInInfo ? usdValueForToken(tokenOutInfo, 1) : customTokenUsdPrice

  const tokenInSymbol = tokenInInfo?.symbol
  const tokenOutSymbol = tokenOutInfo?.symbol

  const priceLabel =
    priceDirection === 'givenIn'
      ? `1 ${tokenInSymbol} = ${effectivePriceReversed} ${tokenOutSymbol} (${toCurrency(
          tokenInUsdValue || 0,
          { abbreviated: false }
        )})`
      : `1 ${tokenOutSymbol} = ${effectivePrice} ${tokenInSymbol} (${toCurrency(
          tokenOutUsdValue || 0,
          { abbreviated: false }
        )})`

  const priceLabelDefault =
    tokenInUsdValue !== undefined && tokenOutUsdValue !== undefined && !isLbpSwap
      ? `1 ${tokenInSymbol} = ${fNum('token', bn(tokenInUsdValue).div(tokenOutUsdValue))} ${tokenOutSymbol} (${toCurrency(
          tokenInUsdValue || 0,
          { abbreviated: false }
        )})`
      : 'Exchange rate: –'

  const togglePriceDirection = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    setPriceDirection(priceDirection === 'givenIn' ? 'givenOut' : 'givenIn')
  }

  return (
    <Text
      _after={{
        borderBottom: '1px dotted',
        borderColor: 'currentColor',
        bottom: '-2px',
        content: '""',
        left: 0,
        opacity: 0.5,
        position: 'absolute',
        width: '100%',
      }}
      _hover={{ color: 'font.link' }}
      cursor="pointer"
      fontSize="sm"
      onClick={togglePriceDirection}
      position="relative"
      variant="secondary"
      w="max-content"
    >
      {simulationQuery.data ? priceLabel : priceLabelDefault}
    </Text>
  )
}
