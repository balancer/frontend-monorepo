import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { bn } from '@repo/lib/shared/utils/numbers'

export function useReClammConfigurationOptions() {
  const { poolCreationForm, reClammConfigForm } = usePoolCreationForm()
  const { poolTokens, network } = poolCreationForm.watch()
  const { initialTargetPrice, targetPriceBoundarySpread } = reClammConfigForm.watch()
  const { usdValueForTokenAddress } = useTokens()

  const priceTokenA = +usdValueForTokenAddress(poolTokens[0]?.address || '', network, '1')
  const priceTokenB = +usdValueForTokenAddress(poolTokens[1]?.address || '', network, '1')

  const currentPrice = bn(priceTokenA).div(priceTokenB)
  const currentPriceMinus5 = currentPrice.times(0.95).toString()
  const currentPricePlus5 = currentPrice.times(1.05).toString()

  // DRY: Extract price bounds calculation
  const calculatePriceBounds = (targetPrice: string, spread: string) => {
    const lowerBoundPercentage = 1 - bn(spread).toNumber()
    const upperBoundPercentage = 1 + bn(spread).toNumber()
    const initialMinPrice = bn(targetPrice).times(lowerBoundPercentage).toString()
    const initialMaxPrice = bn(targetPrice).times(upperBoundPercentage).toString()

    return { initialMinPrice, initialMaxPrice }
  }

  const updatePriceBounds = (targetPrice: string, spread: string) => {
    const { initialMinPrice, initialMaxPrice } = calculatePriceBounds(targetPrice, spread)
    reClammConfigForm.setValue('initialMinPrice', initialMinPrice)
    reClammConfigForm.setValue('initialMaxPrice', initialMaxPrice)
  }

  const targetPriceOptions = [
    {
      label: 'Current price -5%',
      displayValue: Number(currentPriceMinus5).toFixed(2),
      rawValue: currentPriceMinus5,
    },
    {
      label: 'Current price',
      displayValue: Number(currentPrice).toFixed(2),
      rawValue: currentPrice.toString(),
    },
    {
      label: 'Current price +5%',
      displayValue: Number(currentPricePlus5).toFixed(2),
      rawValue: currentPricePlus5,
    },
  ]

  const targetPriceBoundaryOptions = [
    { label: 'Narrow', displayValue: '± 5.00%', rawValue: '.05' },
    { label: 'Standard', displayValue: '± 10.00%', rawValue: '.10' },
    { label: 'Wide', displayValue: '± 15.00%', rawValue: '.15' },
  ]

  const marginBufferOptions = [
    { label: 'Narrow', displayValue: '10%', rawValue: '10' },
    { label: 'Standard', displayValue: '20%', rawValue: '20' },
    { label: 'Wide', displayValue: '30%', rawValue: '30' },
  ]

  const dailyPriceReadjustmentRateOptions = [
    { label: 'Slow', displayValue: '25%', rawValue: '25' },
    { label: 'Standard', displayValue: '50%', rawValue: '50' },
    { label: 'Fast (higher MEV)', displayValue: '75%', rawValue: '75' },
  ]

  return {
    targetPrice: {
      options: targetPriceOptions,
      updateFn: (rawValue: string) => {
        reClammConfigForm.setValue('initialTargetPrice', rawValue)
        if (targetPriceBoundarySpread) {
          updatePriceBounds(rawValue, targetPriceBoundarySpread)
        }
      },
    },
    targetPriceBoundary: {
      options: targetPriceBoundaryOptions,
      updateFn: (rawValue: string) => {
        updatePriceBounds(initialTargetPrice, rawValue)
        reClammConfigForm.setValue('targetPriceBoundarySpread', rawValue)
      },
    },
    marginBuffer: {
      options: marginBufferOptions,
      updateFn: (rawValue: string) => {
        reClammConfigForm.setValue('centerednessMargin', rawValue)
      },
    },
    dailyPriceReadjustmentRate: {
      options: dailyPriceReadjustmentRateOptions,
      updateFn: (rawValue: string) => {
        reClammConfigForm.setValue('priceShiftDailyRate', rawValue)
      },
    },
  }
}
