import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { ReClammConfig } from '../../types'
import { useEffect, useRef } from 'react'
import { formatNumber } from '../../helpers'
import { usePoolSpotPriceWithoutRate } from './usePoolSpotPriceWithoutRate'
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
import { useWatch } from 'react-hook-form'

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
  tooltip: string
}

const CUSTOM_OPTION = {
  label: 'Or choose custom',
  displayValue: '',
  rawValue: '',
}

export function useReClammConfigurationOptions(): ReClammConfigOptionsGroup[] {
  const { poolCreationForm, reClammConfigForm } = usePoolCreationForm()
  const lastCalculatedPriceBoundsRef = useRef({ minPrice: '', maxPrice: '' })

  const poolTokens = useWatch({ control: poolCreationForm.control, name: 'poolTokens' })
  const reClammConfig = useWatch({ control: reClammConfigForm.control })
  const { initialTargetPrice, priceRangePercentage } = reClammConfig

  const tokenSymbolsString = poolTokens.map(token => token.data?.symbol).join(' / ')

  const { spotPriceWithoutRate } = usePoolSpotPriceWithoutRate()
  const currentPriceMinus5 = spotPriceWithoutRate.times(0.95).toString()
  const currentPricePlus5 = spotPriceWithoutRate.times(1.05).toString()

  const calculatePriceBounds = (targetPrice: string, spread: string) => {
    const lowerBoundPercentage = (100 - bn(spread).toNumber()) / 100
    const upperBoundPercentage = (100 + bn(spread).toNumber()) / 100

    const initialMinPrice = bn(targetPrice).times(lowerBoundPercentage).toString()
    const initialMaxPrice = bn(targetPrice).times(upperBoundPercentage).toString()

    return { initialMinPrice, initialMaxPrice }
  }

  const updatePriceBounds = (targetPrice: string, spread: string) => {
    const { initialMinPrice, initialMaxPrice } = calculatePriceBounds(targetPrice, spread)
    reClammConfigForm.setValue('initialMinPrice', initialMinPrice, { shouldValidate: true })
    reClammConfigForm.setValue('initialMaxPrice', initialMaxPrice, { shouldValidate: true })
  }

  const targetPrice = {
    name: 'initialTargetPrice' as const,
    label: `Target price: ${tokenSymbolsString}`,
    customInputLabel: 'Custom target price',
    customInputPlaceholder: bn(spotPriceWithoutRate.toString()).toFixed(2),
    options: [
      {
        label: 'Current price -5%',
        displayValue: formatNumber(currentPriceMinus5),
        rawValue: currentPriceMinus5,
        svg: CurrentPriceMinusFivePercentSVG,
      },
      {
        label: 'Current price',
        displayValue: formatNumber(spotPriceWithoutRate.toString()),
        rawValue: spotPriceWithoutRate.toString(),
        svg: CurrentPriceSVG,
      },
      {
        label: 'Current price +5%',
        displayValue: formatNumber(currentPricePlus5),
        rawValue: currentPricePlus5,
        svg: CurrentPricePlusFivePercentSVG,
      },
      CUSTOM_OPTION,
    ],
    tooltip: 'The initial target price of token A in terms of token B',
    updateFn: (rawValue: string) => {
      reClammConfigForm.setValue('initialTargetPrice', rawValue, { shouldValidate: true })
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
      CUSTOM_OPTION,
    ],
    tooltip: 'The target concentration density of liquidity',
    updateFn: (rawValue: string) => {
      reClammConfigForm.setValue('priceRangePercentage', rawValue, { shouldValidate: true })
      if (rawValue) {
        updatePriceBounds(initialTargetPrice || '', rawValue)
      } else {
        reClammConfigForm.setValue('initialMinPrice', '', { shouldValidate: true })
        reClammConfigForm.setValue('initialMaxPrice', '', { shouldValidate: true })
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
      CUSTOM_OPTION,
    ],
    tooltip: 'How far the price can be from the center before the price range starts to move',
    updateFn: (rawValue: string) => {
      reClammConfigForm.setValue('centerednessMargin', rawValue, { shouldValidate: true })
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
      CUSTOM_OPTION,
    ],
    tooltip: 'Controls the speed of the price shift when out-of-range',
    updateFn: (rawValue: string) => {
      reClammConfigForm.setValue('priceShiftDailyRate', rawValue, { shouldValidate: true })
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

      reClammConfigForm.setValue('initialTargetPrice', currentPrice, { shouldValidate: true })
      reClammConfigForm.setValue('priceRangePercentage', priceRangePercentage, {
        shouldValidate: true,
      })
      reClammConfigForm.setValue('centerednessMargin', centerednessMargin, { shouldValidate: true })
      reClammConfigForm.setValue('priceShiftDailyRate', priceShiftDailyRate, {
        shouldValidate: true,
      })
      updatePriceBounds(currentPrice, priceRangePercentage)
    }
  }, [isInitialReClammConfig])

  useEffect(() => {
    if (!initialTargetPrice || !priceRangePercentage) return

    const { initialMinPrice, initialMaxPrice } = calculatePriceBounds(
      initialTargetPrice,
      priceRangePercentage
    )

    if (
      lastCalculatedPriceBoundsRef.current.minPrice === initialMinPrice &&
      lastCalculatedPriceBoundsRef.current.maxPrice === initialMaxPrice
    ) {
      return
    }

    lastCalculatedPriceBoundsRef.current = { minPrice: initialMinPrice, maxPrice: initialMaxPrice }

    updatePriceBounds(initialTargetPrice, priceRangePercentage)
  }, [initialTargetPrice, priceRangePercentage])

  return [targetPrice, priceRangeBoundaries, marginBuffer, dailyPriceReadjustmentRate]
}
