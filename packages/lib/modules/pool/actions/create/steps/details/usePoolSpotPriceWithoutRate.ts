import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useRateProvider } from '../tokens/useRateProvider'
import { formatUnits, zeroAddress } from 'viem'
import { useWatch } from 'react-hook-form'

/**
 * @returns the current price of the pool in terms of underlying tokens
 */
export function usePoolSpotPriceWithoutRate() {
  const { poolCreationForm } = usePoolCreationForm()
  const [poolTokens, network] = useWatch({
    control: poolCreationForm.control,
    name: ['poolTokens', 'network'],
  })
  const { priceFor } = useTokens()

  const tokenA = poolTokens[0]
  const tokenB = poolTokens[1]

  const priceTokenA = tokenA.usdPrice || priceFor(tokenA?.address || '', network)
  const priceTokenB = tokenB.usdPrice || priceFor(tokenB?.address || '', network)

  const { rate: rawRateTokenA, isRatePending: isRateAPending } = useRateProvider(
    tokenA?.rateProvider,
    network
  )
  const { rate: rawRateTokenB, isRatePending: isRateBPending } = useRateProvider(
    tokenB?.rateProvider,
    network
  )

  // Rate is loading if a token has a rate provider and the rate hasn't loaded yet
  const hasRateProviderA = tokenA?.rateProvider && tokenA.rateProvider !== zeroAddress
  const hasRateProviderB = tokenB?.rateProvider && tokenB.rateProvider !== zeroAddress
  const isRateLoading = (hasRateProviderA && isRateAPending) || (hasRateProviderB && isRateBPending)

  // if token has no rate provider, the rate is simply '1'
  const rateTokenA = rawRateTokenA ? formatUnits(rawRateTokenA, 18) : '1'
  const rateTokenB = rawRateTokenB ? formatUnits(rawRateTokenB, 18) : '1'

  // always scale wrapped token usd price to underlying token usd price
  const adjustedPriceTokenA = bn(priceTokenA).div(rateTokenA)
  const adjustedPriceTokenB = bn(priceTokenB).div(rateTokenB)

  const spotPriceWithoutRate = adjustedPriceTokenA.div(adjustedPriceTokenB)

  return { spotPriceWithoutRate, rateTokenA, rateTokenB, isRateLoading }
}
