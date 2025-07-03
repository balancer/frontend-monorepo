'use client'

import { useSteps } from '@chakra-ui/react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext } from 'react'
import { usePersistentForm } from '@repo/lib/shared/hooks/usePersistentForm'
import { ProjectInfoForm, SaleStructureForm } from './lbp.types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { useLocalStorage } from 'usehooks-ts'
import { useEffect, useState } from 'react'
import { useTokenMetadata } from '../tokens/useTokenMetadata'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { Address } from 'viem'
import { LbpPrice, max, min } from './pool/usePriceInfo'
import { CustomToken } from '@repo/lib/modules/tokens/token.types'

export type UseLbpFormResult = ReturnType<typeof useLbpFormLogic>
export const LbpFormContext = createContext<UseLbpFormResult | null>(null)

const steps = [
  { id: 'step1', title: 'Sale structure' },
  { id: 'step2', title: 'Project info' },
  { id: 'step3', title: 'Review' },
]

export function useLbpFormLogic() {
  const saleStructureForm = usePersistentForm<SaleStructureForm>(
    LS_KEYS.LbpConfig.SaleStructure,
    {
      selectedChain: PROJECT_CONFIG.defaultNetwork,
      launchTokenAddress: '',
      userActions: 'buy_and_sell',
      fee: 1.0,
      startTime: '',
      endTime: '',
      collateralTokenAddress: '',
      weightAdjustmentType: 'linear_90_10',
      customStartWeight: 90,
      customEndWeight: 10,
      saleTokenAmount: '',
      collateralTokenAmount: '',
    },
    { mode: 'all' }
  )

  const projectInfoForm = usePersistentForm<ProjectInfoForm>(
    LS_KEYS.LbpConfig.ProjectInfo,
    {
      name: '',
      description: '',
      tokenIconUrl: '',
      websiteUrl: '',
      xHandle: '',
      telegramHandle: '',
      discordUrl: '',
      owner: '',
      disclaimerAccepted: false,
    },
    { mode: 'all' }
  )

  const [persistedStepIndex, setPersistedStepIndex] = useLocalStorage(
    LS_KEYS.LbpConfig.StepIndex,
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

  const [, setPoolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.LbpConfig.PoolAddress,
    undefined
  )
  const [, setIsMetadataSaved] = useLocalStorage<boolean>(LS_KEYS.LbpConfig.IsMetadataSaved, false)

  const resetLbpCreation = () => {
    saleStructureForm.resetToInitial()
    projectInfoForm.resetToInitial()
    setPersistedStepIndex(0)
    setActiveStep(0)
    setPoolAddress(undefined)
    setIsMetadataSaved(false)
  }

  const { saleTokenAmount, launchTokenAddress, selectedChain } = saleStructureForm.watch()

  const launchTokenSeed = Number(saleTokenAmount || 0)

  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, selectedChain)

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
    chain: selectedChain,
    address: launchTokenAddress as Address,
    symbol: launchTokenMetadata.symbol || '',
    logoURI: projectInfoForm.getValues().tokenIconUrl || '',
    decimals: launchTokenMetadata.decimals || 0,
  }

  return {
    steps,
    activeStepIndex,
    setActiveStep,
    isLastStep,
    activeStep,
    isFirstStep,
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
  }
}

export function LbpFormProvider({ children }: PropsWithChildren) {
  const hook = useLbpFormLogic()
  return <LbpFormContext.Provider value={hook}>{children}</LbpFormContext.Provider>
}

export const useLbpForm = (): UseLbpFormResult => useMandatoryContext(LbpFormContext, 'LbpForm')
