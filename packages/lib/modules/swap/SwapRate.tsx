import { Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useSwap } from './SwapProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useTokens } from '../tokens/TokensProvider'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { GqlSorSwapType } from '@repo/lib/shared/services/api/generated/graphql'

export function SwapRate({ customTokenUsdPrice }: { customTokenUsdPrice?: number }) {
  const [priceDirection, setPriceDirection] = useState<'givenIn' | 'givenOut'>('givenIn')
  const { simulationQuery, tokenInInfo, tokenOutInfo, isLbpSwap, lbpToken } = useSwap()
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

  // Use custom token USD price if available, otherwise use standard token pricing
  const tokenInUsdValue =
    isLbpSwap && lbpToken && tokenInInfo && lbpToken.address === tokenInInfo.address
      ? customTokenUsdPrice
      : usdValueForToken(tokenInInfo, 1)
  const tokenOutUsdValue =
    isLbpSwap && lbpToken && tokenOutInfo && lbpToken.address === tokenOutInfo.address
      ? customTokenUsdPrice
      : usdValueForToken(tokenOutInfo, 1)

  const tokenOutSymbol =
    isLbpSwap && lbpToken && tokenInInfo ? lbpToken.symbol : tokenOutInfo?.symbol

  const tokenInSymbol =
    isLbpSwap && lbpToken && tokenOutInfo ? lbpToken.symbol : tokenInInfo?.symbol

  const priceLabel =
    priceDirection === 'givenIn'
      ? `1 ${tokenInSymbol} = ${effectivePriceReversed} ${tokenOutSymbol} (${toCurrency(
          tokenInUsdValue || 0,
          { abbreviated: false }
        )})`
      : `1 ${tokenOutSymbol} = ${effectivePrice} ${tokenInInfo?.symbol} (${toCurrency(
          tokenOutUsdValue || 0,
          { abbreviated: false }
        )})`

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
      {simulationQuery.data ? priceLabel : 'Exchange rate: –'}
    </Text>
  )
}
