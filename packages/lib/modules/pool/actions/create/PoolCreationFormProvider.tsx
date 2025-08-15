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
import { TokenConfig, TokenType } from '@balancer/sdk'
import { zeroAddress } from 'viem'

export type TokenConfigExtended = TokenConfig & { amount: string; weight: string }

export type PoolConfig = {
  protocol: ProjectConfig['projectId']
  network: GqlChain
  poolType: PoolType
  weightedPoolStructure: '2-token: 50/50' | '2-token: 80/20' | 'custom'
  tokenConfigs: TokenConfigExtended[]
}
export type UsePoolCreationFormResult = ReturnType<typeof usePoolFormLogic>
export const PoolCreationFormContext = createContext<UsePoolCreationFormResult | null>(null)

const steps = [
  { id: 'step1', title: 'Type' },
  { id: 'step2', title: 'Tokens' },
  { id: 'step3', title: 'Details' },
  { id: 'step4', title: 'Fund' },
]

export const initialTokenConfig: TokenConfigExtended = {
  address: zeroAddress,
  rateProvider: zeroAddress,
  paysYieldFees: false,
  tokenType: TokenType.STANDARD,
  amount: '',
  weight: '', // only used for weighted pools
}

export function usePoolFormLogic() {
  const poolConfigForm = usePersistentForm<PoolConfig>(LS_KEYS.PoolCreation.Config, {
    protocol: ProjectConfigBalancer.projectId,
    network: GqlChain.Mainnet,
    poolType: PoolType.Weighted,
    weightedPoolStructure: '2-token: 50/50',
    tokenConfigs: [initialTokenConfig, initialTokenConfig],
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
