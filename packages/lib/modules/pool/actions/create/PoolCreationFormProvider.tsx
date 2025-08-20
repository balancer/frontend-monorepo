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
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import {
  WeightedPoolStructure,
  POOL_CONFIGURATION_STEPS,
  INITIAL_TOKEN_CONFIG,
  SupportedPoolTypes,
} from './constants'
import { Address } from 'viem'

export type PoolCreationToken = {
  address: Address | undefined
  rateProvider: Address | '' // we can infer TokenType based on if zero address or contract address
  paysYieldFees: boolean
  weight?: string
  data?: ApiToken // token data from the API
  amount: string // human amount input
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
  ////// POOL CREATION FORM DATA //////
  const poolConfigForm = usePersistentForm<PoolCreationConfig>(LS_KEYS.PoolCreation.Config, {
    protocol: ProjectConfigBalancer.projectId,
    network: GqlChain.Mainnet,
    poolType: PoolType.Weighted,
    weightedPoolStructure: WeightedPoolStructure.FiftyFifty,
    poolTokens: [INITIAL_TOKEN_CONFIG, INITIAL_TOKEN_CONFIG],
  })

  const { poolTokens, poolType, weightedPoolStructure, protocol, network } = poolConfigForm.watch()

  const updatePoolToken = (index: number, updates: Partial<PoolCreationToken>) => {
    const newPoolTokens = [...poolTokens]
    newPoolTokens[index] = { ...newPoolTokens[index], ...updates }
    poolConfigForm.setValue('poolTokens', newPoolTokens)
  }

  const updatePoolTokens = (updates: PoolCreationToken[]) => {
    poolConfigForm.setValue('poolTokens', updates)
  }

  const addPoolToken = () => {
    const newPoolTokens = [...poolTokens]
    newPoolTokens.push(INITIAL_TOKEN_CONFIG)
    poolConfigForm.setValue('poolTokens', newPoolTokens)
  }

  const removePoolToken = (index: number) => {
    const newPoolTokens = [...poolTokens]
    newPoolTokens.splice(index, 1)
    poolConfigForm.setValue('poolTokens', newPoolTokens)
  }

  ////// CONFIGURATION STEP TRACKING //////
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

  ////// WEIGHTED POOL HELPERS //////
  const isWeightedPool = poolType === PoolType.Weighted
  const totalWeight = poolTokens.reduce((acc, token) => acc + Number(token.weight), 0)
  const isAllValidWeightInputs = poolTokens.every(token => token.weight)
  const isTotalWeightTooLow = isAllValidWeightInputs && totalWeight < 100
  const isTotalWeightTooHigh = totalWeight > 100

  return {
    steps: POOL_CONFIGURATION_STEPS,
    activeStepIndex,
    setActiveStep,
    isLastStep,
    isFirstStep,
    activeStep,
    poolConfigForm,
    poolTokens,
    poolType,
    weightedPoolStructure,
    protocol,
    network,
    updatePoolToken,
    updatePoolTokens,
    removePoolToken,
    addPoolToken,
    isWeightedPool,
    totalWeight,
    isTotalWeightTooLow,
    isTotalWeightTooHigh,
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
