import { useEffect } from 'react'
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { useUninitializedPool } from './useUninitializedPool'

export function useHydratePoolCreationForm() {
  const {
    poolFormData,
    reClammFormData,
    isLoadingPool,
    shouldHydratePoolCreationForm,
    areAllParamsDefined,
    poolAddressParam,
  } = useUninitializedPool()

  const { poolCreationForm, setPoolAddress, reClammConfigForm } = usePoolCreationForm()
  const { lastStep } = usePoolCreationFormSteps()

  // allows user to switch between uninitialzed pools
  useEffect(() => {
    if (areAllParamsDefined) setPoolAddress(undefined)
  }, [areAllParamsDefined])

  useEffect(() => {
    if (!isLoadingPool && shouldHydratePoolCreationForm) {
      if (poolFormData) poolCreationForm.reset(poolFormData)
      if (reClammFormData) reClammConfigForm.reset(reClammFormData)

      setPoolAddress(poolAddressParam)
      lastStep()
    }
  }, [isLoadingPool, shouldHydratePoolCreationForm])

  return { isLoadingPool }
}
