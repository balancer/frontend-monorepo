import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext } from 'react'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { PoolType } from '@balancer/sdk'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ProjectConfigBalancer } from '@repo/lib/config/projects/balancer'
import { type ProjectConfig } from '@repo/lib/config/config.types'
import { usePersistentForm } from '@repo/lib/shared/hooks/usePersistentForm'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { WeightedPoolStructure, INITIAL_TOKEN_CONFIG, SupportedPoolTypes } from './constants'
import { Address } from 'viem'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { useLocalStorage } from 'usehooks-ts'
import { zeroAddress } from 'viem'

export type PoolCreationToken = {
  address: Address | undefined
  rateProvider: Address | '' // infer TokenType based on if RP is zero address or contract address
  paysYieldFees: boolean
  weight?: string // human weight input
  amount: string // human amount input
  data?: ApiToken
}

export type PoolCreationConfig = {
  protocol: ProjectConfig['projectId']
  network: GqlChain
  weightedPoolStructure: WeightedPoolStructure
  poolType: SupportedPoolTypes
  poolTokens: PoolCreationToken[]
  name: string
  symbol: string
  swapFeeManager: Address | ''
  pauseManager: Address | ''
  swapFeePercentage: string
  amplificationParameter: string
  poolHooksContract: Address | ''
  enableDonation: boolean
  disableUnbalancedLiquidity: boolean
}

export type UsePoolCreationFormResult = ReturnType<typeof usePoolFormLogic>
export const PoolCreationFormContext = createContext<UsePoolCreationFormResult | null>(null)

export function usePoolFormLogic() {
  const [, setPoolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.PoolCreation.PoolAddress,
    undefined
  )

  const { resetSteps } = usePoolCreationFormSteps()

  const poolConfigForm = usePersistentForm<PoolCreationConfig>(
    LS_KEYS.PoolCreation.Config,
    {
      protocol: ProjectConfigBalancer.projectId,
      network: GqlChain.Mainnet,
      weightedPoolStructure: WeightedPoolStructure.FiftyFifty,
      poolType: PoolType.Weighted,
      poolTokens: [INITIAL_TOKEN_CONFIG, INITIAL_TOKEN_CONFIG],
      name: '',
      symbol: '',
      swapFeeManager: zeroAddress,
      pauseManager: zeroAddress,
      swapFeePercentage: '',
      amplificationParameter: '',
      poolHooksContract: zeroAddress,
      enableDonation: false,
      disableUnbalancedLiquidity: false,
    },
    { mode: 'all' }
  )

  const {
    poolTokens,
    poolType,
    weightedPoolStructure,
    protocol,
    network,
    name,
    symbol,
    swapFeeManager,
    pauseManager,
    swapFeePercentage,
    poolHooksContract,
    enableDonation,
    disableUnbalancedLiquidity,
    amplificationParameter,
  } = poolConfigForm.watch()

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

  const resetPoolCreationForm = () => {
    setPoolAddress(undefined)
    poolConfigForm.resetToInitial()
    resetSteps()
  }

  return {
    poolConfigForm,
    isFormStateValid: poolConfigForm.formState.isValid,
    poolTokens,
    poolType,
    weightedPoolStructure,
    protocol,
    network,
    name,
    symbol,
    swapFeeManager,
    pauseManager,
    swapFeePercentage,
    amplificationParameter,
    poolHooksContract,
    enableDonation,
    disableUnbalancedLiquidity,
    updatePoolToken,
    updatePoolTokens,
    removePoolToken,
    addPoolToken,
    resetPoolCreationForm,
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
