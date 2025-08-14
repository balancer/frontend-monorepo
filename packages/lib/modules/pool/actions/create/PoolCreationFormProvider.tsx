import { useSteps } from '@chakra-ui/react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { useEffect } from 'react'
import { PoolType } from '@balancer/sdk'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ProjectConfigBalancer } from '@repo/lib/config/projects/balancer'
import { type ProjectConfig } from '@repo/lib/config/config.types'
import { usePersistentForm } from '@repo/lib/shared/hooks/usePersistentForm'

export type PoolConfig = {
  protocol: ProjectConfig['projectId']
  network: GqlChain
  poolType: PoolType
}
export type UsePoolCreationFormResult = ReturnType<typeof usePoolFormLogic>
export const PoolCreationFormContext = createContext<UsePoolCreationFormResult | null>(null)

const steps = [
  { id: 'step1', title: 'Type' },
  { id: 'step2', title: 'Tokens' },
  { id: 'step3', title: 'Details' },
  { id: 'step4', title: 'Fund' },
]

export function usePoolFormLogic() {
  const poolConfigForm = usePersistentForm<PoolConfig>(LS_KEYS.PoolCreation.Config, {
    protocol: ProjectConfigBalancer.projectId,
    network: GqlChain.Mainnet,
    poolType: PoolType.Weighted,
  })

  const [persistedStepIndex, setPersistedStepIndex] = useLocalStorage(
    LS_KEYS.PoolCreation.StepIndex,
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
    poolConfigForm,
  }
}

export function PoolFormProvider({ children }: PropsWithChildren) {
  const hook = usePoolFormLogic()
  return (
    <PoolCreationFormContext.Provider value={hook}>{children}</PoolCreationFormContext.Provider>
  )
}

export const usePoolCreationForm = (): UsePoolCreationFormResult =>
  useMandatoryContext(PoolCreationFormContext, 'PoolCreationForm')
