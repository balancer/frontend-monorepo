'use client'

import { useSteps } from '@chakra-ui/react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext } from 'react'
import { usePersistentForm } from '@repo/lib/shared/hooks/usePeristedForm'
import { ProjectInfoForm, SaleStructureForm } from './lbp.types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'

export type UseLbpFormResult = ReturnType<typeof useLbpFormLogic>
export const LbpFormContext = createContext<UseLbpFormResult | null>(null)

const steps = [
  { id: 'step1', title: 'Sale structure' },
  { id: 'step2', title: 'Project info' },
  { id: 'step3', title: 'Review' },
]

export function useLbpFormLogic() {
  const saleStructureForm = usePersistentForm<SaleStructureForm>(
    LS_KEYS.LbpConfig.SaleStructure,
    {
      selectedChain: PROJECT_CONFIG.defaultNetwork,
      launchTokenAddress: '',
      userActions: 'buy_and_sell',
      startTime: '',
      endTime: '',
      collateralTokenAddress: '',
      weightAdjustmentType: 'linear_90_10',
      saleTokenAmount: '',
      collateralTokenAmount: '',
    },
    { mode: 'all' }
  )

  const projectInfoForm = usePersistentForm<ProjectInfoForm>(LS_KEYS.LbpConfig.ProjectInfo, {
    name: '',
    description: '',
    tokenIconUrl: '',
    websiteUrl: '',
    xHandle: '',
    telegramHandle: '',
    discordUrl: '',
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
  const hook = useLbpFormLogic()
  return <LbpFormContext.Provider value={hook}>{children}</LbpFormContext.Provider>
}

export const useLbpForm = (): UseLbpFormResult => useMandatoryContext(LbpFormContext, 'LbpForm')
