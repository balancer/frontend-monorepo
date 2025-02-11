'use client'

import { useSteps } from '@chakra-ui/react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext } from 'react'

export type UseLbpFormResult = ReturnType<typeof _useLbpForm>
export const LbpFormContext = createContext<UseLbpFormResult | null>(null)

const steps = [
  { id: 'saleStructure', title: 'Sale structure' },
  { id: 'projectInfo', title: 'Project info' },
  { id: 'review', title: 'Review' },
]

export function _useLbpForm() {
  const { activeStep: activeStepIndex, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  })

  const isLastStep = activeStepIndex === steps.length - 1
  const isFirstStep = activeStepIndex === 0

  const activeStep = steps[activeStepIndex]

  return {
    steps,
    activeStepIndex,
    setActiveStep,
    isLastStep,
    activeStep,
    isFirstStep,
  }
}

export function LbpFormProvider({ children }: PropsWithChildren) {
  const hook = _useLbpForm()
  return <LbpFormContext.Provider value={hook}>{children}</LbpFormContext.Provider>
}

export const useLbpForm = (): UseLbpFormResult => useMandatoryContext(LbpFormContext, 'LbpForm')
