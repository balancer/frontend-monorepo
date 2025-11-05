import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { usePoolSpotPriceWithoutRate } from './usePoolSpotPriceWithoutRate'
import { useEffect } from 'react'
import { calculateRotationComponents } from './gyro.helpers'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'

const BOUNDARY_FACTOR = 0.1 // 10%
const NUM_FORMAT = '0.00000000' // up to 8 decimals?

export function useSuggestedGyroEclpConfig() {
  const poolSpotPrice = usePoolSpotPriceWithoutRate()
  const { eclpConfigForm } = usePoolCreationForm()
  const { lambda } = eclpConfigForm.watch()
  const isEmptyEclpConfig = Object.values(eclpConfigForm.watch()).every(value => value === '')

  const { c, s } = calculateRotationComponents(poolSpotPrice.toString())
  const alpha = fNumCustom(poolSpotPrice.times(1 - BOUNDARY_FACTOR), NUM_FORMAT)
  const beta = fNumCustom(poolSpotPrice.times(1 + BOUNDARY_FACTOR), NUM_FORMAT)
  const suggestedLamba = '100' // how to calculate good starting lambda?

  const suggestedEclpConfig = {
    alpha,
    beta,
    c,
    s,
    lambda: lambda || suggestedLamba,
    peakPrice: fNumCustom(poolSpotPrice, NUM_FORMAT),
  }

  useEffect(() => {
    if (isEmptyEclpConfig) {
      eclpConfigForm.reset(suggestedEclpConfig)
    }
  }, [isEmptyEclpConfig, poolSpotPrice])

  return suggestedEclpConfig
}
