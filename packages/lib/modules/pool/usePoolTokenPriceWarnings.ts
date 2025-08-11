import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { Pool } from './pool.types'

export function usePoolTokenPriceWarnings(pool?: Pool) {
  const { priceFor } = useTokens()

  if (!pool)
    return {
      isAnyTokenWithoutPrice: false,
      poolWarning: '',
      totalLiquidityTip: '',
      addLiquidityWarning: '',
      removeLiquidityWarning: '',
      tokenPriceTip: '',
      tokenWeightTip: '',
    }

  const tokensWithoutPrice = pool.poolTokens
    .filter(token => !priceFor(token.address, pool.chain))
    .map(token => token.symbol)

  const isAnyTokenWithoutPrice = tokensWithoutPrice.length > 0

  const formattedTokensWithoutPrice = formatStringsToSentenceList(tokensWithoutPrice)

  const poolWarning = `This pool's total value does not include the value of ${formattedTokensWithoutPrice} tokens since the current price cannot be accessed.`
  const tokenPriceTip =
    'The price of this token currently cannot be accessed. This may be due to our pricing provider, Coingecko, being down or not knowing it.'
  const tokenWeightTip =
    'Current weight percentages cannot be calculated since the price of one or more tokens are unknown.'
  const totalLiquidityTip = `This amount does not include the value of ${formattedTokensWithoutPrice} tokens since the current price cannot be accessed.`
  const addLiquidityWarning = `Proportional adds avoid price impact by matching the current ratio of each token's USD value within the pool. However, for some reason, the price of ${formattedTokensWithoutPrice} currently cannot be accessed. This may be due to the pricing provider, Coingecko, being down or not knowing one of the tokens. Only proceed if you know exactly what you are doing.`
  const removeLiquidityWarning = `The price of ${formattedTokensWithoutPrice} currently cannot be accessed. This may be due to the pricing provider, Coingecko, being down or not knowing one of the tokens. Only interact with this pool if you know exactly what you are doing.`

  return {
    isAnyTokenWithoutPrice,
    poolWarning,
    totalLiquidityTip,
    addLiquidityWarning,
    removeLiquidityWarning,
    tokenPriceTip,
    tokenWeightTip,
  }
}

export function formatStringsToSentenceList(strings: string[]) {
  if (strings.length === 1) return strings[0]
  if (strings.length > 1) {
    return strings.slice(0, -1).join(', ') + ` and ` + strings[strings.length - 1]
  }
}
