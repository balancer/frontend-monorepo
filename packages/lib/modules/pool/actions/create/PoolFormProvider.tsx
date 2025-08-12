'use client'

import { useSteps } from '@chakra-ui/react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { useEffect } from 'react'

export type UsePoolFormResult = ReturnType<typeof usePoolFormLogic>
export const PoolFormContext = createContext<UsePoolFormResult | null>(null)

const steps = [{ id: 'step1', title: 'Pool type' }]

export function usePoolFormLogic() {
  const [persistedStepIndex, setPersistedStepIndex] = useLocalStorage(
    LS_KEYS.LbpConfig.StepIndex,
    0
  )
  const { activeStep: activeStepIndex, setActiveStep } = useSteps({
    index: persistedStepIndex,
    count: steps.length,
  })
  const isLastStep = activeStepIndex === steps.length - 1
  const isFirstStep = activeStepIndex === 0
  const activeStep = steps[activeStepIndex]

  useEffect(() => {
    setPersistedStepIndex(activeStepIndex)
  }, [activeStepIndex, setPersistedStepIndex])

  return {
    steps,
    activeStepIndex,
    setActiveStep,
    isLastStep,
    isFirstStep,
    activeStep,
  }
}

export function PoolFormProvider({ children }: PropsWithChildren) {
  const hook = usePoolFormLogic()
  return <PoolFormContext.Provider value={hook}>{children}</PoolFormContext.Provider>
}

export const usePoolForm = (): UsePoolFormResult => useMandatoryContext(PoolFormContext, 'PoolForm')
