import { useEffect } from 'react'
import { usePoolCreationForm } from './PoolCreationFormProvider'

import { useUninitializedPool } from './useUninitializedPool'

export function useHydratePoolCreationForm() {
  const {
    poolFormData,
    reClammFormData,
    eclpFormData,
    isLoadingPool,
    shouldHydratePoolCreationForm,
    areAllParamsDefined,
    poolAddressParam,
  } = useUninitializedPool()

  const { poolCreationForm, setPoolAddress, reClammConfigForm, eclpConfigForm, goToLastStep } =
    usePoolCreationForm()

  // allows user to switch between uninitialzed pools
  useEffect(() => {
    if (areAllParamsDefined) setPoolAddress(undefined)
  }, [areAllParamsDefined])

  useEffect(() => {
    if (!isLoadingPool && shouldHydratePoolCreationForm) {
      if (poolFormData) poolCreationForm.reset(poolFormData)
      if (reClammFormData) reClammConfigForm.reset(reClammFormData)
      if (eclpFormData) eclpConfigForm.reset(eclpFormData)

      setPoolAddress(poolAddressParam)
      goToLastStep()
    }
  }, [isLoadingPool, shouldHydratePoolCreationForm])

  return { isLoadingPool }
}
