import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { bn } from '@repo/lib/shared/utils/numbers'

export function useReClammConfigurationOptions() {
  const { poolCreationForm } = usePoolCreationForm()
  const { poolTokens, network } = poolCreationForm.watch()
  const { usdValueForTokenAddress } = useTokens()

  const priceTokenA = +usdValueForTokenAddress(poolTokens[0]?.address || '', network, '1')
  const priceTokenB = +usdValueForTokenAddress(poolTokens[1]?.address || '', network, '1')

  const currentPrice = bn(priceTokenA).div(priceTokenB)
  const currentPriceMinus5 = currentPrice.times(0.95).toString()
  const currentPricePlus5 = currentPrice.times(1.05).toString()

  const targetPrices = [
    {
      label: 'Current price -5%',
      displayValue: Number(currentPriceMinus5).toFixed(2),
      preciseValue: currentPriceMinus5,
    },
    {
      label: 'Current price',
      displayValue: Number(currentPrice).toFixed(2),
      preciseValue: currentPrice.toString(),
    },
    {
      label: 'Current price +5%',
      displayValue: Number(currentPricePlus5).toFixed(2),
      preciseValue: currentPricePlus5,
    },
  ]

  const targetPriceBoundaries = [
    { label: 'Narrow', displayValue: '± 5.00%', preciseValue: '5' },
    { label: 'Standard', displayValue: '± 10.00%', preciseValue: '10' },
    { label: 'Wide', displayValue: '± 15.00%', preciseValue: '15' },
  ]

  const marginBuffers = [
    { label: 'Narrow', displayValue: '2.50%', preciseValue: '2.5' },
    { label: 'Standard', displayValue: '5.00%', preciseValue: '5' },
    { label: 'Wide', displayValue: '7.50%', preciseValue: '7.5' },
  ]

  const dailyPriceReadjustmentRates = [
    { label: 'Slow', displayValue: '50%', preciseValue: '0.5' },
    { label: 'Standard', displayValue: '100%', preciseValue: '1' },
    { label: 'Fast (higher MEV)', displayValue: '150%', preciseValue: '1.5' },
  ]

  return { targetPrices, targetPriceBoundaries, marginBuffers, dailyPriceReadjustmentRates }
}
