import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext } from 'react'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { usePersistentForm } from '@repo/lib/shared/hooks/usePersistentForm'
import {
  INITIAL_TOKEN_CONFIG,
  INITIAL_POOL_CREATION_FORM,
  INITIAL_RECLAMM_CONFIG,
} from './constants'
import { PoolCreationForm, PoolCreationToken, ReClammConfig } from './types'
import { Address } from 'viem'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { useLocalStorage } from 'usehooks-ts'
import { PoolType } from '@balancer/sdk'

export type UsePoolCreationFormResult = ReturnType<typeof usePoolFormLogic>
export const PoolCreationFormContext = createContext<UsePoolCreationFormResult | null>(null)

export function usePoolFormLogic() {
  const [, setPoolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.PoolCreation.Address,
    undefined
  )

  const reClammConfigForm = usePersistentForm<ReClammConfig>(
    LS_KEYS.PoolCreation.ReClammConfig,
    INITIAL_RECLAMM_CONFIG
  )

  const poolCreationForm = usePersistentForm<PoolCreationForm>(
    LS_KEYS.PoolCreation.Form,
    INITIAL_POOL_CREATION_FORM,
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
  } = poolCreationForm.watch()

  const isReClamm = poolType === PoolType.ReClamm
  const isStablePool = poolType === PoolType.Stable
  const isStableSurgePool = poolType === PoolType.StableSurge
  const isWeightedPool = poolType === PoolType.Weighted

  const updatePoolToken = (index: number, updates: Partial<PoolCreationToken>) => {
    const newPoolTokens = [...poolTokens]
    newPoolTokens[index] = { ...newPoolTokens[index], ...updates }
    poolCreationForm.setValue('poolTokens', newPoolTokens)
  }

  const updatePoolTokens = (updates: PoolCreationToken[]) => {
    poolCreationForm.setValue('poolTokens', updates)
  }

  const addPoolToken = () => {
    const newPoolTokens = [...poolTokens]
    newPoolTokens.push(INITIAL_TOKEN_CONFIG)
    poolCreationForm.setValue('poolTokens', newPoolTokens)
  }

  const removePoolToken = (index: number) => {
    const newPoolTokens = [...poolTokens]
    newPoolTokens.splice(index, 1)
    poolCreationForm.setValue('poolTokens', newPoolTokens)
  }

  const { resetSteps } = usePoolCreationFormSteps()

  const resetPoolCreationForm = () => {
    setPoolAddress(undefined)
    poolCreationForm.resetToInitial()
    reClammConfigForm.resetToInitial()
    resetSteps()
  }

  return {
    poolCreationForm,
    reClammConfigForm,
    isFormStateValid: poolCreationForm.formState.isValid,
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
    isReClamm,
    isStablePool,
    isStableSurgePool,
    isWeightedPool,
    updatePoolToken,
    updatePoolTokens,
    removePoolToken,
    addPoolToken,
    resetPoolCreationForm,
  }
}

export function PoolCreationFormProvider({ children }: PropsWithChildren) {
  const hook = usePoolFormLogic()
  return (
    <PoolCreationFormContext.Provider value={hook}>{children}</PoolCreationFormContext.Provider>
  )
}

export const usePoolCreationForm = (): UsePoolCreationFormResult =>
  useMandatoryContext(PoolCreationFormContext, 'PoolCreationForm')
