'use client'

import { useSteps } from '@chakra-ui/react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext } from 'react'
import { useForm } from 'react-hook-form'
import { ProjectInfoForm, SaleStructureForm } from './lbp.types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export type UseLbpFormResult = ReturnType<typeof _useLbpForm>
export const LbpFormContext = createContext<UseLbpFormResult | null>(null)

const steps = [
  { id: 'step1', title: 'Sale structure' },
  { id: 'step2', title: 'Project info' },
  { id: 'step3', title: 'Review' },
]

export function _useLbpForm() {
  const saleStructureForm = useForm<SaleStructureForm>({
    defaultValues: {
      selectedChain: PROJECT_CONFIG.defaultNetwork,
      launchTokenAddress: '',
    },
  })

  const projectInfoForm = useForm<ProjectInfoForm>({
    defaultValues: {
      name: '',
      description: '',
      tokenIconUrl: '',
      websiteUrl: '',
      xHandle: '',
      telegramHandle: '',
      discordUrl: '',
    },
  })

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
    saleStructureForm,
    projectInfoForm,
  }
}

export function LbpFormProvider({ children }: PropsWithChildren) {
  const hook = _useLbpForm()
  return <LbpFormContext.Provider value={hook}>{children}</LbpFormContext.Provider>
}

export const useLbpForm = (): UseLbpFormResult => useMandatoryContext(LbpFormContext, 'LbpForm')
