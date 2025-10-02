import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { ReClammConfig } from '../../types'
import { useEffect } from 'react'
import { formatNumber } from '../../helpers'
import { useReClammCurrentPrice } from './useReClammCurrentPrice'
import { SVGProps } from 'react'
import {
  CurrentPriceMinusFivePercentSVG,
  CurrentPriceSVG,
  CurrentPricePlusFivePercentSVG,
  TargetRangeNarrowSVG,
  TargetRangeStandardSVG,
  TargetRangeWideSVG,
  MarginBufferNarrowSVG,
  MarginBufferStandardSVG,
  MarginBufferWideSVG,
  PriceAdjustmentRateSlowSVG,
  PriceAdjustmentRateStandardSVG,
  PriceAdjustmentRateFastSVG,
} from '@repo/lib/shared/components/imgs/ReClammConfigSvgs'

export type ReClammConfigOptionsGroup = {
  label: string
  options: {
    label: string
    displayValue: string
    rawValue: string
    svg?: React.ComponentType<SVGProps<SVGSVGElement>>
  }[]
  updateFn: (rawValue: string) => void
  validateFn: (value: string) => string | boolean
  name: keyof ReClammConfig
  customInputLabel: string
}

export function useReClammConfigurationOptions(): ReClammConfigOptionsGroup[] {
  const { poolCreationForm, reClammConfigForm } = usePoolCreationForm()
  const { poolTokens } = poolCreationForm.watch()
  const reClammConfig = reClammConfigForm.watch()
  const { initialTargetPrice, priceRangePercentage } = reClammConfig

  const tokenSymbolsString = poolTokens.map(token => token.data?.symbol).join(' / ')

  const currentPrice = useReClammCurrentPrice()
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
    customInputPlaceholder: bn(currentPrice).toFixed(2),
    options: [
      {
        label: 'Current price -5%',
        displayValue: formatNumber(currentPriceMinus5),
        rawValue: currentPriceMinus5,
        svg: CurrentPriceMinusFivePercentSVG,
      },
      {
        label: 'Current price',
        displayValue: formatNumber(currentPrice.toString()),
        rawValue: currentPrice.toString(),
        svg: CurrentPriceSVG,
      },
      {
        label: 'Current price +5%',
        displayValue: formatNumber(currentPricePlus5),
        rawValue: currentPricePlus5,
        svg: CurrentPricePlusFivePercentSVG,
      },
      {
        label: 'Or choose custom',
        displayValue: '',
        rawValue: '',
        svg: CurrentPricePlusFivePercentSVG,
      },
    ],
    updateFn: (rawValue: string) => {
      reClammConfigForm.setValue('initialTargetPrice', rawValue)
      if (priceRangePercentage) {
        updatePriceBounds(rawValue, priceRangePercentage)
      }
    },
    validateFn: (value: string) => {
      if (!Number(value)) return 'Invalid target price'
      return true
    },
  }

  const priceRangeBoundaries = {
    label: `Target concentration density of liquidity`,
    name: 'priceRangePercentage' as const,
    customInputLabel: '???',
    options: [
      { label: 'Narrow', displayValue: '± 25.00%', rawValue: '25', svg: TargetRangeNarrowSVG },
      { label: 'Standard', displayValue: '± 50.00%', rawValue: '50', svg: TargetRangeStandardSVG },
      { label: 'Wide', displayValue: '± 75.00%', rawValue: '75', svg: TargetRangeWideSVG },
      { label: 'Or choose custom', displayValue: '', rawValue: '', svg: TargetRangeWideSVG },
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
    validateFn: (value: string) => {
      if (!Number(value)) return 'Invalid price range percentage'
      return true
    },
  }

  const marginBuffer = {
    name: 'centerednessMargin' as const,
    label: `Margin buffer`,
    customInputLabel: 'Custom margin buffer',
    options: [
      { label: 'Narrow', displayValue: '10%', rawValue: '10', svg: MarginBufferNarrowSVG },
      { label: 'Standard', displayValue: '25%', rawValue: '25', svg: MarginBufferStandardSVG },
      { label: 'Wide', displayValue: '50%', rawValue: '50', svg: MarginBufferWideSVG },
      { label: 'Or choose custom', displayValue: '', rawValue: '', svg: MarginBufferWideSVG },
    ],
    updateFn: (rawValue: string) => {
      reClammConfigForm.setValue('centerednessMargin', rawValue)
    },
    validateFn: (value: string) => {
      const numValue = Number(value)
      if (numValue <= 0) return 'Margin buffer must be greater than 0%'
      if (numValue >= 90) return 'Margin buffer must be less than or equal to 90%'
      return true
    },
  }

  const dailyPriceReadjustmentRate = {
    name: 'priceShiftDailyRate' as const,
    label: `Daily price re-adjustment rate, when out-of-range`,
    customInputLabel: 'Custom rate',
    options: [
      { label: 'Slow', displayValue: '25%', rawValue: '25', svg: PriceAdjustmentRateSlowSVG },
      {
        label: 'Standard',
        displayValue: '50%',
        rawValue: '50',
        svg: PriceAdjustmentRateStandardSVG,
      },
      {
        label: 'Fast (higher MEV)',
        displayValue: '75%',
        rawValue: '75',
        svg: PriceAdjustmentRateFastSVG,
      },
      {
        label: 'Or choose custom',
        displayValue: '',
        rawValue: '',
        svg: PriceAdjustmentRateFastSVG,
      },
    ],
    updateFn: (rawValue: string) => {
      reClammConfigForm.setValue('priceShiftDailyRate', rawValue)
    },
    validateFn: (value: string) => {
      const numValue = Number(value)
      if (numValue <= 0) return 'The rate must be greater than 0%'
      if (numValue > 100) return 'The rate must be less than or equal to 100%'
      return true
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

  useEffect(() => {
    if (!initialTargetPrice || !priceRangePercentage) return

    updatePriceBounds(initialTargetPrice, priceRangePercentage)
  }, [initialTargetPrice, priceRangePercentage])

  return [targetPrice, priceRangeBoundaries, marginBuffer, dailyPriceReadjustmentRate]
}
