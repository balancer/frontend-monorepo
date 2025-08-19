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
import { TokenConfig } from '@balancer/sdk'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import {
  WeightedPoolStructure,
  POOL_CONFIGURATION_STEPS,
  DEFAULT_TOKEN,
  SupportedPoolTypes,
} from './constants'

export type PoolCreationToken = {
  config: TokenConfig & { weight?: string }
  data?: ApiToken // initially undefined
  amount: string
  weight?: string // only for weighted pool type
}

export type PoolCreationConfig = {
  protocol: ProjectConfig['projectId']
  network: GqlChain
  poolType: SupportedPoolTypes
  weightedPoolStructure: WeightedPoolStructure
  poolTokens: PoolCreationToken[]
}
export type UsePoolCreationFormResult = ReturnType<typeof usePoolFormLogic>
export const PoolCreationFormContext = createContext<UsePoolCreationFormResult | null>(null)

export function usePoolFormLogic() {
  const poolConfigForm = usePersistentForm<PoolCreationConfig>(LS_KEYS.PoolCreation.Config, {
    protocol: ProjectConfigBalancer.projectId,
    network: GqlChain.Mainnet,
    poolType: PoolType.Weighted,
    weightedPoolStructure: WeightedPoolStructure.FiftyFifty,
    poolTokens: [DEFAULT_TOKEN, DEFAULT_TOKEN],
  })

  const [persistedStepIndex, setPersistedStepIndex] = useLocalStorage(
    LS_KEYS.PoolCreation.StepIndex,
    0
  )
  const { activeStep: activeStepIndex, setActiveStep } = useSteps({
    index: persistedStepIndex,
    count: POOL_CONFIGURATION_STEPS.length,
  })
  const isLastStep = activeStepIndex === POOL_CONFIGURATION_STEPS.length - 1
  const isFirstStep = activeStepIndex === 0
  const activeStep = POOL_CONFIGURATION_STEPS[activeStepIndex]

  useEffect(() => {
    setPersistedStepIndex(activeStepIndex)
  }, [activeStepIndex, setPersistedStepIndex])

  return {
    steps: POOL_CONFIGURATION_STEPS,
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
