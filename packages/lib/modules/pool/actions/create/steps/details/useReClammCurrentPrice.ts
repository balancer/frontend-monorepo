import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useRateProvider } from '../tokens/useRateProvider'
import { formatUnits } from 'viem'

/**
 * @returns the current price of the pool in terms of underlying tokens
 */
export function useReClammCurrentPrice() {
  const { poolCreationForm } = usePoolCreationForm()
  const { poolTokens, network } = poolCreationForm.watch()
  const { priceFor } = useTokens()

  const tokenA = poolTokens[0]
  const tokenB = poolTokens[1]

  const priceTokenA = tokenA.usdPrice || +priceFor(tokenA?.address || '', network)
  const priceTokenB = tokenB.usdPrice || +priceFor(tokenB?.address || '', network)

  const { rate: rawRateTokenA } = useRateProvider(tokenA?.rateProvider, network)
  const { rate: rawRateTokenB } = useRateProvider(tokenB?.rateProvider, network)

  // if token has no rate provider, the rate is simply '1'
  const rateTokenA = rawRateTokenA ? formatUnits(rawRateTokenA, 18) : '1'
  const rateTokenB = rawRateTokenB ? formatUnits(rawRateTokenB, 18) : '1'

  // always scale wrapped token usd price to underlying token usd price
  const adjustedPriceTokenA = bn(priceTokenA).div(rateTokenA)
  const adjustedPriceTokenB = bn(priceTokenB).div(rateTokenB)

  const currentPrice = adjustedPriceTokenA.div(adjustedPriceTokenB)

  return currentPrice
}
