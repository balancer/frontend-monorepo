import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { usePoolSpotPriceWithoutRate } from './usePoolSpotPriceWithoutRate'
import { useEffect } from 'react'
import { calculateRotationComponents } from './gyro.helpers'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { NUM_FORMAT } from '../../constants'
import { useWatch } from 'react-hook-form'

const BOUNDARY_FACTOR = 0.1 // 10%

export function useSuggestedGyroEclpConfig() {
  const { spotPriceWithoutRate, isRateLoading } = usePoolSpotPriceWithoutRate()
  const { eclpConfigForm } = usePoolCreationForm()
  const formValues = useWatch({ control: eclpConfigForm.control })
  const isEmptyEclpConfig = Object.values(formValues).every(value => value === '')

  const { c, s } = calculateRotationComponents(spotPriceWithoutRate.toString())
  const alpha = fNumCustom(spotPriceWithoutRate.times(1 - BOUNDARY_FACTOR), NUM_FORMAT)
  const beta = fNumCustom(spotPriceWithoutRate.times(1 + BOUNDARY_FACTOR), NUM_FORMAT)

  const suggestedEclpConfig = {
    alpha,
    beta,
    c,
    s,
    lambda: '100',
    peakPrice: fNumCustom(spotPriceWithoutRate, NUM_FORMAT),
  }

  useEffect(() => {
    if (isEmptyEclpConfig && !isRateLoading) eclpConfigForm.reset(suggestedEclpConfig)
  }, [isEmptyEclpConfig, isRateLoading, suggestedEclpConfig])

  return suggestedEclpConfig
}
