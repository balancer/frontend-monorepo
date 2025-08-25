import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext } from 'react'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { usePersistentForm } from '@repo/lib/shared/hooks/usePersistentForm'
import {
  INITIAL_TOKEN_CONFIG,
  INITIAL_POOL_CREATION_CONFIG,
  type PoolCreationConfig,
  type PoolCreationToken,
} from './constants'
import { Address } from 'viem'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { useLocalStorage } from 'usehooks-ts'

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
    INITIAL_POOL_CREATION_CONFIG,
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
