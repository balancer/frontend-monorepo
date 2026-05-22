import { useEffect } from 'react'
import { usePoolCreationForm } from './PoolCreationFormProvider'

import { useUninitializedPool } from './useUninitializedPool'

export function useHydratePoolCreationForm() {
  const {
    poolFormData,
    autoRangeFormData,
    eclpFormData,
    isLoadingPool,
    shouldHydratePoolCreationForm,
    areAllParamsDefined,
    poolAddressParam,
  } = useUninitializedPool()

  const { poolCreationForm, setPoolAddress, autoRangeConfigForm, eclpConfigForm, goToLastStep } =
    usePoolCreationForm()

  // allows user to switch between uninitialzed pools
  useEffect(() => {
    if (areAllParamsDefined) setPoolAddress(undefined)
  }, [areAllParamsDefined])

  useEffect(() => {
    if (!isLoadingPool && shouldHydratePoolCreationForm) {
      if (poolFormData) poolCreationForm.reset(poolFormData)
      if (autoRangeFormData) autoRangeConfigForm.reset(autoRangeFormData)
      if (eclpFormData) eclpConfigForm.reset(eclpFormData)

      setPoolAddress(poolAddressParam)
      goToLastStep()
    }
  }, [isLoadingPool, shouldHydratePoolCreationForm])

  return { isLoadingPool }
}
