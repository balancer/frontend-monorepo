'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext } from 'react'
import { usePersistentForm } from '@repo/lib/shared/hooks/usePersistentForm'
import { ProjectInfoForm, SaleStructureForm } from './lbp.types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { useLocalStorage } from 'usehooks-ts'
import { useState } from 'react'
import { useTokenMetadata } from '../tokens/useTokenMetadata'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { Address } from 'viem'
import { LbpPrice, max, min } from './pool/usePriceInfo'
import { CustomToken } from '@repo/lib/modules/tokens/token.types'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { getChainId } from '@repo/lib/config/app.config'
import { useWatch } from 'react-hook-form'
import { useFormSteps } from '@repo/lib/shared/hooks/useFormSteps'
import { LBP_FORM_STEPS, INITIAL_SALE_STRUCTURE, INITIAL_PROJECT_INFO } from './constants.lbp'
import { useTokens } from '../tokens/TokensProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { SaleType } from './lbp.types'

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
  const [, setIsMetadataSaved] = useLocalStorage<boolean>(LS_KEYS.LbpConfig.IsMetadataSaved, false)

  const [startDateTime, endDateTime] = useWatch({
    control: saleStructureForm.control,
    name: ['startDateTime', 'endDateTime'],
  })

  const isSaleFormValid = !!(startDateTime && endDateTime)
  // isSaleFormValid breaks reset on review step for some unknown reason because it stays true after from data reset
  // const { isValid: isSaleFormValid } = useFormState({ control: saleStructureForm.control })

  const formSteps = useFormSteps({
    steps: LBP_FORM_STEPS,
    basePath: '/lbp/create',
    localStorageKey: LS_KEYS.LbpConfig.StepIndex,
    isFormHydrated: saleStructureForm.isHydrated && projectInfoForm.isHydrated,
    shouldSkipRedirectToSavedStep: false,
    canRenderStepFn: (stepIndex: number) => {
      console.log({ stepIndex, isSaleFormValid })
      if (stepIndex > 0) return isSaleFormValid
      return true
    },
  })

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
    launchTokenPrice,
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

  const launchTokenPriceFiat =
    collateralTokenPrice && launchTokenPrice
      ? bn(launchTokenPrice).times(collateralTokenPrice).toString()
      : '0'

  const totalValue = saleTokenAmount
    ? bn(saleTokenAmount).times(launchTokenPriceFiat).toString()
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

  const isDynamicSale = saleType !== '' && saleType === SaleType.DYNAMIC_PRICE_LBP
  const isFixedSale = saleType !== '' && saleType === SaleType.FIXED_PRICE_LBP

  return {
    ...formSteps,
    saleStructureForm,
    projectInfoForm,
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
    launchTokenPriceFiat: toCurrency(launchTokenPriceFiat),
    totalValue: toCurrency(totalValue),
    isDynamicSale,
    isFixedSale,
  }
}

export function LbpFormProvider({ children }: PropsWithChildren) {
  const hook = useLbpFormLogic()
  return <LbpFormContext.Provider value={hook}>{children}</LbpFormContext.Provider>
}

export const useLbpForm = (): UseLbpFormResult => useMandatoryContext(LbpFormContext, 'LbpForm')
