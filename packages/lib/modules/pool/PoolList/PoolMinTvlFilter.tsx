import { useEffect, useState } from 'react'
import {
  VStack,
  HStack,
  Heading,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { usePoolList } from './PoolListProvider'
import { NumberText } from '@repo/lib/shared/components/typography/NumberText'

// --- TVL value <-> slider value mapping ---
const SLIDER_Q1_VALUE = 100_000
const SLIDER_MID_VALUE = 1_000_000
const SLIDER_MAX_SLIDER_VALUE = 1000

/**
 * Map slider value (0-1000) to TVL value.
 * 0–250: linear from 0 to 100,000
 * 250–500: linear from 100,000 to 1,000,000
 * 500–1000: exponential from 1,000,000 to 100,000,000
 */
function sliderValueToTvl(sliderValue: number): number {
  if (sliderValue <= 250) {
    // Linear: 0–250 → 0–100,000
    return Math.round((sliderValue / 250) * SLIDER_Q1_VALUE)
  } else if (sliderValue <= 500) {
    // Linear: 250–500 → 100,000–1,000,000
    const t = (sliderValue - 250) / 250
    return Math.round(SLIDER_Q1_VALUE + t * (SLIDER_MID_VALUE - SLIDER_Q1_VALUE))
  } else {
    // Exponential: 500–1000 → 1,000,000–100,000,000
    const minLog = 6
    const maxLog = 8
    const expPercent = (sliderValue - 500) / 500
    const logValue = minLog + (maxLog - minLog) * expPercent
    return Math.round(Math.pow(10, logValue))
  }
}

/**
 * Map TVL value to slider value (0-1000)
 */
function tvlToSliderValue(tvl: number): number {
  if (tvl <= SLIDER_Q1_VALUE) {
    // Linear: 0–100,000 → 0–250
    return (tvl / SLIDER_Q1_VALUE) * 250
  } else if (tvl <= SLIDER_MID_VALUE) {
    // Linear: 100,000–1,000,000 → 250–500
    const t = (tvl - SLIDER_Q1_VALUE) / (SLIDER_MID_VALUE - SLIDER_Q1_VALUE)
    return 250 + t * 250
  } else {
    // Exponential: 1,000,000–100,000,000 → 500–1000
    const minLog = 6
    const maxLog = 8
    const valueLog = Math.log10(tvl)
    const expPercent = (valueLog - minLog) / (maxLog - minLog)
    return 500 + expPercent * 500
  }
}

const SLIDER_STEP_CONFIG: { until: number; step: number }[] = [
  { until: 10000, step: 1000 },
  { until: 50000, step: 2500 },
  { until: 100000, step: 5000 },
  { until: 500000, step: 25000 },
  { until: 1000000, step: 50000 },
  { until: 10000000, step: 100000 },
  { until: 100000000, step: 1000000 },
]

function snapToStep(value: number): number {
  let prevUntil = 0
  for (const { until, step } of SLIDER_STEP_CONFIG) {
    if (value <= until) {
      const base = prevUntil
      const snapped = Math.round((value - base) / step) * step + base
      return Math.max(base, Math.min(snapped, until))
    }
    prevUntil = until
  }
  const { until, step } = SLIDER_STEP_CONFIG[SLIDER_STEP_CONFIG.length - 1]
  const base = SLIDER_STEP_CONFIG[SLIDER_STEP_CONFIG.length - 2].until
  const snapped = Math.round((value - base) / step) * step + base
  return Math.max(base, Math.min(snapped, until))
}

export function PoolMinTvlFilter() {
  const { toCurrency } = useCurrency()
  const {
    queryState: { minTvl, setMinTvl },
  } = usePoolList()
  const [sliderValue, setSliderValue] = useState(() => tvlToSliderValue(minTvl))

  const tvlValue = sliderValueToTvl(sliderValue)

  useEffect(() => {
    setSliderValue(tvlToSliderValue(minTvl))
  }, [minTvl])

  const handleSliderChange = (val: number) => {
    const rawValue = sliderValueToTvl(val)
    const snappedValue = snapToStep(rawValue)
    setSliderValue(tvlToSliderValue(snappedValue))
  }

  const handleSliderChangeEnd = (val: number) => {
    const rawValue = sliderValueToTvl(val)
    const snappedValue = snapToStep(rawValue)
    setMinTvl(snappedValue > 0 ? snappedValue : null)
  }

  return (
    <VStack w="full">
      <HStack w="full">
        <Heading as="h3" mb="xs" mt="sm" size="sm">
          Minimum TVL
        </Heading>
        <NumberText fontSize="sm" ml="auto">
          {toCurrency(tvlValue)}
        </NumberText>
      </HStack>
      <Slider
        aria-label="slider-min-tvl"
        max={SLIDER_MAX_SLIDER_VALUE}
        min={0}
        ml="sm"
        onChange={handleSliderChange}
        onChangeEnd={handleSliderChangeEnd}
        step={1}
        value={sliderValue}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </VStack>
  )
}
