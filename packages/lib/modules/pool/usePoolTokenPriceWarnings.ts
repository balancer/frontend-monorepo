import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { Pool } from './pool.types'

export function usePoolTokenPriceWarnings(pool?: Pool) {
  const { priceFor, isLoadingTokenPrices } = useTokens()

  if (!pool || isLoadingTokenPrices) {
    return {
      isAnyTokenWithoutPrice: false,
      poolWarning: '',
      totalLiquidityTip: '',
      addLiquidityWarning: '',
      removeLiquidityWarning: '',
      tokenPriceTip: '',
      tokenWeightTip: '',
      tokensWithoutPrice: {},
    }
  }

  const tokensWithoutPrice: Record<string, string> = Object.fromEntries(
    pool.poolTokens
      .filter(token => !priceFor(token.address, pool.chain))
      .map(token => [token.address, token.symbol])
  )

  const missingSymbols = Object.values(tokensWithoutPrice)
  const isAnyTokenWithoutPrice = missingSymbols.length > 0
  const formattedTokensWithoutPrice = formatStringsToSentenceList(missingSymbols)
  const tokenNoun = missingSymbols.length === 1 ? 'token' : 'tokens'

  const poolWarning = isAnyTokenWithoutPrice
    ? `This pool's total value does not include the value of ${formattedTokensWithoutPrice} ${tokenNoun} since the current price cannot be accessed.`
    : ''

  const tokenPriceTip =
    'The price of this token currently cannot be accessed. This may be due to our pricing provider, CoinGecko, being down or not listing it.'

  const tokenWeightTip =
    'Current weight percentages cannot be calculated since the price of one or more tokens are unknown.'

  const totalLiquidityTip = isAnyTokenWithoutPrice
    ? `This amount does not include the value of ${formattedTokensWithoutPrice} ${tokenNoun} since the current price cannot be accessed.`
    : ''

  const addLiquidityWarning = isAnyTokenWithoutPrice
    ? `Proportional adds avoid price impact by matching the current ratio of each token's USD value within the pool. However, the price of ${formattedTokensWithoutPrice} ${tokenNoun} currently cannot be accessed. This may be due to the pricing provider, CoinGecko being down or not listing one of the tokens. Only proceed if you know exactly what you are doing.`
    : ''

  const removeLiquidityWarning = isAnyTokenWithoutPrice
    ? `The price of ${formattedTokensWithoutPrice} ${tokenNoun} currently cannot be accessed. This may be due to the pricing provider, CoinGecko being down or not listing one of the tokens. Only interact with this pool if you know exactly what you are doing.`
    : ''

  return {
    isAnyTokenWithoutPrice,
    poolWarning,
    totalLiquidityTip,
    addLiquidityWarning,
    removeLiquidityWarning,
    tokenPriceTip,
    tokenWeightTip,
    tokensWithoutPrice,
  }
}

export function formatStringsToSentenceList(strings: string[]) {
  if (strings.length === 1) return strings[0]
  if (strings.length > 1) {
    return strings.slice(0, -1).join(', ') + ` and ` + strings[strings.length - 1]
  }
}
