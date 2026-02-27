'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext, useState } from 'react'
import { usePersistentForm } from '@repo/lib/shared/hooks/usePersistentForm'
import { ProjectInfoForm, SaleStructureForm, WeightAdjustmentType } from './lbp.types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { useLocalStorage } from 'usehooks-ts'
import { useTokenMetadata } from '../tokens/useTokenMetadata'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { Address } from 'viem'
import { LbpPrice, max, min } from './pool/usePriceInfo'
import { CustomToken } from '@repo/lib/modules/tokens/token.types'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { getChainId } from '@repo/lib/config/app.config'
import { useFormState, useWatch } from 'react-hook-form'
import { useFormSteps } from '@repo/lib/shared/hooks/useFormSteps'
import { LBP_FORM_STEPS, INITIAL_SALE_STRUCTURE, INITIAL_PROJECT_INFO } from './constants.lbp'
import { validateProjectInfoStep, validateSaleStructureStep } from './lbp.validation'
import { useTokens } from '../tokens/TokensProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'

export type UseLbpFormResult = ReturnType<typeof useLbpFormLogic>
export const LbpFormContext = createContext<UseLbpFormResult | null>(null)

export function useLbpFormLogic() {
  const { toCurrency } = useCurrency()

  const saleStructureForm = usePersistentForm<SaleStructureForm>(
    LS_KEYS.LbpConfig.SaleStructure,
    INITIAL_SALE_STRUCTURE,
    { mode: 'all' }
  )

  const projectInfoForm = usePersistentForm<ProjectInfoForm>(
    LS_KEYS.LbpConfig.ProjectInfo,
    INITIAL_PROJECT_INFO,
    { mode: 'all' }
  )

  const [poolAddress, setPoolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.LbpConfig.PoolAddress,
    undefined
  )
  const isProjectInfoLocked = !!poolAddress
  const [, setIsMetadataSaved] = useLocalStorage<boolean>(LS_KEYS.LbpConfig.IsMetadataSaved, false)

  const [startDateTime, endDateTime, weightAdjustmentType, customStartWeight, customEndWeight] =
    useWatch({
      control: saleStructureForm.control,
      name: [
        'startDateTime',
        'endDateTime',
        'weightAdjustmentType',
        'customStartWeight',
        'customEndWeight',
      ],
    })

  const saleStructureFormState = useFormState({ control: saleStructureForm.control })
  const hasValidCustomWeights =
    weightAdjustmentType !== WeightAdjustmentType.CUSTOM ||
    (customStartWeight !== undefined &&
      customEndWeight !== undefined &&
      customStartWeight >= 1 &&
      customStartWeight <= 99 &&
      customEndWeight >= 1 &&
      customEndWeight <= 99)
  const isSaleFormValid = !!(startDateTime && endDateTime && saleStructureFormState.isValid)
  const canRenderSaleStep = isSaleFormValid && hasValidCustomWeights

  const formSteps = useFormSteps({
    steps: LBP_FORM_STEPS,
    basePath: '/lbp/create',
    localStorageKey: LS_KEYS.LbpConfig.StepIndex,
    isFormHydrated: saleStructureForm.isHydrated && projectInfoForm.isHydrated,
    shouldSkipRedirectToSavedStep: false,
    canRenderStepFn: (stepIndex: number) => {
      if (stepIndex > 0) return canRenderSaleStep
      return true
    },
  })

  const validateCurrentStep = async () => {
    if (formSteps.currentStepIndex === 0) {
      return validateSaleStructureStep(saleStructureForm)
    }
    if (formSteps.currentStepIndex === 1) {
      return validateProjectInfoStep(projectInfoForm)
    }
    const saleValid = await validateSaleStructureStep(saleStructureForm)
    const projectValid = await validateProjectInfoStep(projectInfoForm)
    return saleValid && projectValid
  }

  const resetLbpCreation = () => {
    formSteps.resetSteps()
    setPoolAddress(undefined)
    saleStructureForm.resetToInitial()
    projectInfoForm.resetToInitial()
    setIsMetadataSaved(false)
  }

  const {
    saleTokenAmount,
    launchTokenAddress,
    selectedChain,
    collateralTokenAddress,
    launchTokenRate,
    saleType,
  } = useWatch({
    control: saleStructureForm.control,
  })

  const { priceFor } = useTokens()

  const chain = selectedChain || PROJECT_CONFIG.defaultNetwork
  const { tokens } = getNetworkConfig(selectedChain)
  const isCollateralNativeAsset =
    (collateralTokenAddress || '').toLowerCase() === tokens.nativeAsset.address.toLowerCase()

  const launchTokenSeed = Number(saleTokenAmount || 0)

  const launchTokenMetadata = useTokenMetadata(launchTokenAddress || '', chain)

  const [maxPrice, setMaxPrice] = useState(0)
  const [saleMarketCap, setSaleMarketCap] = useState('')
  const [fdvMarketCap, setFdvMarketCap] = useState('')

  const collateralTokenPrice = collateralTokenAddress ? priceFor(collateralTokenAddress, chain) : 0

  const launchTokenPriceUsd =
    collateralTokenPrice && launchTokenRate
      ? bn(launchTokenRate).times(collateralTokenPrice).toString()
      : '0'

  const totalValue = saleTokenAmount
    ? bn(saleTokenAmount).times(launchTokenPriceUsd).toString()
    : '0'

  const updatePriceStats = (prices: LbpPrice[]) => {
    const minPrice = min(prices)
    const maxPrice = max(prices)
    const minSaleMarketCap = minPrice * launchTokenSeed
    const maxSaleMarketCap = maxPrice * launchTokenSeed
    const minFdvMarketCap = minPrice * (launchTokenMetadata?.totalSupply || 0)
    const maxFdvMarketCap = maxPrice * (launchTokenMetadata?.totalSupply || 0)

    setMaxPrice(maxPrice)
    setSaleMarketCap(`$${fNum('fiat', minSaleMarketCap)} - $${fNum('fiat', maxSaleMarketCap)}`)
    setFdvMarketCap(`$${fNum('fiat', minFdvMarketCap)} - $${fNum('fiat', maxFdvMarketCap)}`)
  }

  const launchToken: CustomToken = {
    name: launchTokenMetadata.name || '',
    chain,
    chainId: getChainId(chain),
    address: launchTokenAddress as Address,
    symbol: launchTokenMetadata.symbol || '',
    logoURI: projectInfoForm.getValues().tokenIconUrl || '',
    decimals: launchTokenMetadata.decimals || 0,
  }

  const isDynamicSale = saleType === GqlPoolType.LiquidityBootstrapping
  const isFixedSale = saleType === GqlPoolType.FixedLbp

  return {
    ...formSteps,
    saleStructureForm,
    projectInfoForm,
    validateCurrentStep,
    maxPrice: toCurrency(maxPrice),
    saleMarketCap,
    fdvMarketCap,
    updatePriceStats,
    launchTokenSeed,
    resetLbpCreation,
    launchTokenMetadata,
    launchToken,
    isCollateralNativeAsset,
    poolAddress,
    setPoolAddress,
    isProjectInfoLocked,
    launchTokenPriceUsd: toCurrency(launchTokenPriceUsd),
    launchTokenPriceRaw: launchTokenPriceUsd,
    totalValueUsd: toCurrency(totalValue),
    totalValueRaw: totalValue,
    isDynamicSale,
    isFixedSale,
  }
}

export function LbpFormProvider({ children }: PropsWithChildren) {
  const hook = useLbpFormLogic()
  return <LbpFormContext.Provider value={hook}>{children}</LbpFormContext.Provider>
}

export const useLbpForm = (): UseLbpFormResult => useMandatoryContext(LbpFormContext, 'LbpForm')
