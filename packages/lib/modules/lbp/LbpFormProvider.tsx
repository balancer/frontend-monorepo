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
import { fNum } from '@repo/lib/shared/utils/numbers'
import { Address } from 'viem'
import { LbpPrice, max, min } from './pool/usePriceInfo'
import { CustomToken } from '@repo/lib/modules/tokens/token.types'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { getChainId } from '@repo/lib/config/app.config'
import { useWatch } from 'react-hook-form'
import { useFormSteps } from '@repo/lib/shared/hooks/useFormSteps'
import { LBP_FORM_STEPS, INITIAL_SALE_STRUCTURE, INITIAL_PROJECT_INFO } from './constants.lbp'

export type UseLbpFormResult = ReturnType<typeof useLbpFormLogic>
export const LbpFormContext = createContext<UseLbpFormResult | null>(null)

export function useLbpFormLogic() {
  const formSteps = useFormSteps({
    steps: LBP_FORM_STEPS,
    basePath: '/lbp/create',
    localStorageKey: LS_KEYS.LbpConfig.StepIndex,
  })

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

  const resetLbpCreation = () => {
    setPoolAddress(undefined)
    saleStructureForm.resetToInitial()
    projectInfoForm.resetToInitial()
    setIsMetadataSaved(false)
    formSteps.resetSteps()
  }

  const { saleTokenAmount, launchTokenAddress, selectedChain, collateralTokenAddress } = useWatch({
    control: saleStructureForm.control,
  })

  const chain = selectedChain || PROJECT_CONFIG.defaultNetwork
  const { tokens } = getNetworkConfig(selectedChain)
  const isCollateralNativeAsset =
    (collateralTokenAddress || '').toLowerCase() === tokens.nativeAsset.address.toLowerCase()

  const launchTokenSeed = Number(saleTokenAmount || 0)

  const launchTokenMetadata = useTokenMetadata(launchTokenAddress || '', chain)

  const [maxPrice, setMaxPrice] = useState(0)
  const [saleMarketCap, setSaleMarketCap] = useState('')
  const [fdvMarketCap, setFdvMarketCap] = useState('')

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

  return {
    ...formSteps,
    saleStructureForm,
    projectInfoForm,
    maxPrice,
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
  }
}

export function LbpFormProvider({ children }: PropsWithChildren) {
  const hook = useLbpFormLogic()
  return <LbpFormContext.Provider value={hook}>{children}</LbpFormContext.Provider>
}

export const useLbpForm = (): UseLbpFormResult => useMandatoryContext(LbpFormContext, 'LbpForm')
