import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { ReClammConfig } from '../../types'
import { useEffect } from 'react'

export type ReClammConfigOptionsGroup = {
  label: string
  options: { label: string; displayValue: string; rawValue: string }[]
  updateFn: (rawValue: string) => void
  name: keyof ReClammConfig
  customInputLabel: string
}

export function useReClammConfigurationOptions(): ReClammConfigOptionsGroup[] {
  const { poolCreationForm, reClammConfigForm } = usePoolCreationForm()
  const { poolTokens, network } = poolCreationForm.watch()
  const reClammConfig = reClammConfigForm.watch()
  const { initialTargetPrice, priceRangePercentage } = reClammConfig
  const { usdValueForTokenAddress } = useTokens()

  const tokenSymbolsString = poolTokens.map(token => token.data?.symbol).join(' / ')

  const priceTokenA = +usdValueForTokenAddress(poolTokens[0]?.address || '', network, '1')
  const priceTokenB = +usdValueForTokenAddress(poolTokens[1]?.address || '', network, '1')

  const currentPrice = bn(priceTokenA).div(priceTokenB)
  const currentPriceMinus5 = currentPrice.times(0.95).toString()
  const currentPricePlus5 = currentPrice.times(1.05).toString()

  const calculatePriceBounds = (targetPrice: string, spread: string) => {
    const lowerBoundPercentage = (100 - bn(spread).toNumber()) / 100
    const upperBoundPercentage = (100 + bn(spread).toNumber()) / 100

    const initialMinPrice = bn(targetPrice).times(lowerBoundPercentage).toString()
    const initialMaxPrice = bn(targetPrice).times(upperBoundPercentage).toString()

    return { initialMinPrice, initialMaxPrice }
  }

  const updatePriceBounds = (targetPrice: string, spread: string) => {
    const { initialMinPrice, initialMaxPrice } = calculatePriceBounds(targetPrice, spread)
    reClammConfigForm.setValue('initialMinPrice', initialMinPrice)
    reClammConfigForm.setValue('initialMaxPrice', initialMaxPrice)
  }

  const targetPrice = {
    name: 'initialTargetPrice' as const,
    label: `Target price: ${tokenSymbolsString}`,
    customInputLabel: 'Custom target price',
    options: [
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
    ],
    updateFn: (rawValue: string) => {
      reClammConfigForm.setValue('initialTargetPrice', rawValue)
      if (priceRangePercentage) {
        updatePriceBounds(rawValue, priceRangePercentage)
      }
    },
  }

  const priceRangeBoundaries = {
    label: `Target concentration density of liquidity`,
    name: 'priceRangePercentage' as const,
    customInputLabel: '???',
    options: [
      { label: 'Narrow', displayValue: '± 5.00%', rawValue: '5' },
      { label: 'Standard', displayValue: '± 10.00%', rawValue: '10' },
      { label: 'Wide', displayValue: '± 15.00%', rawValue: '15' },
    ],
    updateFn: (rawValue: string) => {
      reClammConfigForm.setValue('priceRangePercentage', rawValue)
      if (rawValue) {
        updatePriceBounds(initialTargetPrice, rawValue)
      } else {
        reClammConfigForm.setValue('initialMinPrice', '')
        reClammConfigForm.setValue('initialMaxPrice', '')
      }
    },
  }

  const marginBuffer = {
    name: 'centerednessMargin' as const,
    label: `Margin buffer`,
    customInputLabel: 'Custom margin buffer',
    options: [
      { label: 'Narrow', displayValue: '10%', rawValue: '10' },
      { label: 'Standard', displayValue: '20%', rawValue: '20' },
      { label: 'Wide', displayValue: '30%', rawValue: '30' },
    ],
    updateFn: (rawValue: string) => {
      reClammConfigForm.setValue('centerednessMargin', rawValue)
    },
  }

  const dailyPriceReadjustmentRate = {
    name: 'priceShiftDailyRate' as const,
    label: `Daily price re-adjustment rate, when out-of-range`,
    customInputLabel: 'Custom rate',
    options: [
      { label: 'Slow', displayValue: '25%', rawValue: '25' },
      { label: 'Standard', displayValue: '50%', rawValue: '50' },
      { label: 'Fast (higher MEV)', displayValue: '75%', rawValue: '75' },
    ],
    updateFn: (rawValue: string) => {
      reClammConfigForm.setValue('priceShiftDailyRate', rawValue)
    },
  }

  const isInitialReClammConfig = Object.values(reClammConfig).every(value => value === '')

  // auto-fill config with default values
  useEffect(() => {
    if (isInitialReClammConfig) {
      const currentPrice = targetPrice.options[1].rawValue
      const priceRangePercentage = priceRangeBoundaries.options[1].rawValue
      const centerednessMargin = marginBuffer.options[1].rawValue
      const priceShiftDailyRate = dailyPriceReadjustmentRate.options[1].rawValue

      reClammConfigForm.setValue('initialTargetPrice', currentPrice)
      reClammConfigForm.setValue('priceRangePercentage', priceRangePercentage)
      reClammConfigForm.setValue('centerednessMargin', centerednessMargin)
      reClammConfigForm.setValue('priceShiftDailyRate', priceShiftDailyRate)
      updatePriceBounds(currentPrice, priceRangePercentage)
    }
  }, [isInitialReClammConfig])

  return [targetPrice, priceRangeBoundaries, marginBuffer, dailyPriceReadjustmentRate]
}
