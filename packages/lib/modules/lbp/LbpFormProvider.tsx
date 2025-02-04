'use client'

import { useSteps } from '@chakra-ui/react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext } from 'react'

export type UseLbpFormResult = ReturnType<typeof _useLbpForm>
export const LbpFormContext = createContext<UseLbpFormResult | null>(null)

const steps = [
  { id: 'lbpStep1', title: 'Sale structure' },
  { id: 'lbpStep2', title: 'Project info' },
  { id: 'lbpStep3', title: 'Review' },
]

export function _useLbpForm() {
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  })

  const isLastStep = activeStep === steps.length - 1

  return {
    steps,
    activeStep,
    setActiveStep,
    isLastStep,
  }
}

export function LbpFormProvider({ children }: PropsWithChildren) {
  const hook = _useLbpForm()
  return <LbpFormContext.Provider value={hook}>{children}</LbpFormContext.Provider>
}

export const useLbpForm = (): UseLbpFormResult => useMandatoryContext(LbpFormContext, 'LbpForm')
