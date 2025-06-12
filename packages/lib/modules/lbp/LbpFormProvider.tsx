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
  const [, setIsMetadataSent] = useLocalStorage<boolean>(LS_KEYS.LbpConfig.IsMetadataSent, false)

  const resetLbpCreation = () => {
    saleStructureForm.resetToInitial()
    projectInfoForm.resetToInitial()
    setPersistedStepIndex(0)
    setActiveStep(0)
    setPoolAddress(undefined)
    setIsMetadataSent(false)
  }

  const { saleTokenAmount, launchTokenAddress, selectedChain } = saleStructureForm.watch()

  const launchTokenSeed = Number(saleTokenAmount || 0)
  const { totalSupply: launchTokenTotalSupply } = useTokenMetadata(
    launchTokenAddress,
    selectedChain
  )

  const [maxPrice, setMaxPrice] = useState(0)
  const [saleMarketCap, setSaleMarketCap] = useState('')
  const [fdvMarketCap, setFdvMarketCap] = useState('')

  const updatePriceStats = (prices: number[][]) => {
    const minPrice = Math.min(...prices.map(point => point[1]))
    const maxPrice = Math.max(...prices.map(point => point[1]))
    const minSaleMarketCap = minPrice * launchTokenSeed
    const maxSaleMarketCap = maxPrice * launchTokenSeed
    const minFdvMarketCap = minPrice * (launchTokenTotalSupply || 0)
    const maxFdvMarketCap = maxPrice * (launchTokenTotalSupply || 0)

    setMaxPrice(maxPrice)
    setSaleMarketCap(`$${fNum('fiat', minSaleMarketCap)} - $${fNum('fiat', maxSaleMarketCap)}`)
    setFdvMarketCap(`$${fNum('fiat', minFdvMarketCap)} - $${fNum('fiat', maxFdvMarketCap)}`)
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
  }
}

export function LbpFormProvider({ children }: PropsWithChildren) {
  const hook = useLbpFormLogic()
  return <LbpFormContext.Provider value={hook}>{children}</LbpFormContext.Provider>
}

export const useLbpForm = (): UseLbpFormResult => useMandatoryContext(LbpFormContext, 'LbpForm')
