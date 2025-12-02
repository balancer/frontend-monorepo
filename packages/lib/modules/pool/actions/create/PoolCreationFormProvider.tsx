import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext } from 'react'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { usePersistentForm } from '@repo/lib/shared/hooks/usePersistentForm'
import {
  INITIAL_TOKEN_CONFIG,
  INITIAL_POOL_CREATION_FORM,
  INITIAL_RECLAMM_CONFIG,
  INITIAL_ECLP_CONFIG,
  NUM_FORMAT,
} from './constants'
import { PoolCreationForm, PoolCreationToken, ReClammConfig, EclpConfigForm } from './types'
import { Address } from 'viem'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { useLocalStorage } from 'usehooks-ts'
import { invertNumber } from '@repo/lib/shared/utils/numbers'
import { ApiOrCustomToken } from '@repo/lib/modules/tokens/token.types'
import { useMemo } from 'react'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useRouter } from 'next/navigation'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { useWatch } from 'react-hook-form'

export type UsePoolCreationFormResult = ReturnType<typeof usePoolFormLogic>
export const PoolCreationFormContext = createContext<UsePoolCreationFormResult | null>(null)

export function usePoolFormLogic() {
  const router = useRouter()

  const [poolAddress, setPoolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.PoolCreation.Address,
    undefined
  )

  const reClammConfigForm = usePersistentForm<ReClammConfig>(
    LS_KEYS.PoolCreation.ReClammConfig,
    INITIAL_RECLAMM_CONFIG,
    { mode: 'all' }
  )

  const eclpConfigForm = usePersistentForm<EclpConfigForm>(
    LS_KEYS.PoolCreation.EclpConfig,
    INITIAL_ECLP_CONFIG,
    { mode: 'all' }
  )

  const poolCreationForm = usePersistentForm<PoolCreationForm>(
    LS_KEYS.PoolCreation.Form,
    INITIAL_POOL_CREATION_FORM,
    { mode: 'all' }
  )

  const updatePoolToken = (index: number, updates: Partial<PoolCreationToken>) => {
    const currentPoolTokens = poolCreationForm.getValues('poolTokens')
    const newPoolTokens = [...currentPoolTokens]
    newPoolTokens[index] = { ...newPoolTokens[index], ...updates }
    poolCreationForm.setValue('poolTokens', newPoolTokens)
  }

  const invertReClammPriceParams = () => {
    const { initialMinPrice, initialMaxPrice, initialTargetPrice } = reClammConfigForm.getValues()
    reClammConfigForm.setValue('initialMinPrice', invertNumber(initialMaxPrice))
    reClammConfigForm.setValue('initialMaxPrice', invertNumber(initialMinPrice))
    reClammConfigForm.setValue('initialTargetPrice', invertNumber(initialTargetPrice))

    // keep order of pool tokens consistent with reclamm params
    const { poolTokens } = poolCreationForm.getValues()
    poolCreationForm.setValue('poolTokens', [...poolTokens].reverse())
  }

  const invertGyroEclpPriceParams = () => {
    const { alpha, beta, peakPrice, s, c, lambda } = eclpConfigForm.getValues()
    eclpConfigForm.reset({
      alpha: fNumCustom(invertNumber(beta), NUM_FORMAT),
      beta: fNumCustom(invertNumber(alpha), NUM_FORMAT),
      peakPrice: fNumCustom(invertNumber(peakPrice), NUM_FORMAT),
      s: c,
      c: s,
      lambda: lambda,
    })

    // keep order of pool tokens consistent with gyro eclp params
    const { poolTokens } = poolCreationForm.getValues()
    poolCreationForm.setValue('poolTokens', [...poolTokens].reverse())
  }

  const addPoolToken = () => {
    const { poolTokens } = poolCreationForm.getValues()
    poolCreationForm.setValue('poolTokens', [...poolTokens, INITIAL_TOKEN_CONFIG])
  }

  const removePoolToken = (index: number) => {
    const { poolTokens } = poolCreationForm.getValues()
    poolCreationForm.setValue(
      'poolTokens',
      poolTokens.filter((_, i) => i !== index)
    )
  }

  const { resetSteps } = usePoolCreationFormSteps()

  const resetPoolCreationForm = () => {
    setPoolAddress(undefined)
    poolCreationForm.resetToInitial()
    reClammConfigForm.resetToInitial()
    eclpConfigForm.resetToInitial()
    resetSteps()
    router.replace('/create')
  }

  const { getTokensByChain, isLoadingTokens: isLoadingTokenList } = useTokens()
  const [network, poolTokens] = useWatch({
    control: poolCreationForm.control,
    name: ['network', 'poolTokens'],
  })

  const tokenList = useMemo(() => {
    const networkTokens = getTokensByChain(network.toUpperCase() as GqlChain) || []
    const networkAddresses = new Set(networkTokens.map(t => t.address))

    const unknownTokens = poolTokens
      .filter(token => token.address && !networkAddresses.has(token.address))
      .map(token => token.data)
      .filter((token): token is ApiOrCustomToken => token !== undefined)

    return [...networkTokens, ...unknownTokens]
  }, [getTokensByChain, network, poolTokens])

  return {
    poolCreationForm,
    reClammConfigForm,
    eclpConfigForm,
    updatePoolToken,
    removePoolToken,
    addPoolToken,
    invertReClammPriceParams,
    invertGyroEclpPriceParams,
    resetPoolCreationForm,
    tokenList,
    isLoadingTokenList,
    poolAddress,
    setPoolAddress,
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
