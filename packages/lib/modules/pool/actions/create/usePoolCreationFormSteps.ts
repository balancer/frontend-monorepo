import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useLocalStorage } from 'usehooks-ts'
import { ComponentType, useEffect, useRef } from 'react'
import { isAddress } from 'viem'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { PoolTypeStep } from './steps/type/PoolTypeStep'
import { PoolTokensStep } from './steps/tokens/PoolTokensStep'
import { PoolDetailsStep } from './steps/details/PoolDetailsStep'
import { PoolFundStep } from './steps/fund/PoolFundStep'

const scrollToTop = () => {
  window.scrollTo(0, 0)
}

export interface PoolCreationFormStep {
  id: string
  title: string
  Component: ComponentType
}

const steps: PoolCreationFormStep[] = [
  { id: 'step-1-type', title: 'Type', Component: PoolTypeStep },
  { id: 'step-2-tokens', title: 'Tokens', Component: PoolTokensStep },
  { id: 'step-3-details', title: 'Details', Component: PoolDetailsStep },
  { id: 'step-4-fund', title: 'Fund', Component: PoolFundStep },
]

function getStepIndexFromPathname(pathname: string): number | null {
  const index = steps.findIndex(step => pathname.endsWith(step.id))
  return index >= 0 ? index : null
}

function endsWithEthereumAddress(pathname: string): boolean {
  const lastSegment = pathname.split('/').pop() ?? ''
  return isAddress(lastSegment)
}

export function usePoolCreationFormSteps() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [savedStepIndex, setSavedStepIndex] = useLocalStorage(LS_KEYS.PoolCreation.StepIndex, 0)

  const stepIndexFromUrl = getStepIndexFromPathname(pathname)
  const isPathForChooseProtocol = searchParams.has('protocol')
  const isPathForLoadPoolInit = endsWithEthereumAddress(pathname)

  // URL drives current step; localStorage is fallback for initial load only
  const currentStepIndex = stepIndexFromUrl ?? savedStepIndex

  const isLastStep = currentStepIndex === steps.length - 1
  const isFirstStep = currentStepIndex === 0
  const currentStep = steps[currentStepIndex]

  // On initial load without valid URL step, redirect to saved step from localStorage
  const hasRedirected = useRef(false)
  useEffect(() => {
    if (hasRedirected.current || isPathForChooseProtocol || isPathForLoadPoolInit) return
    if (stepIndexFromUrl === null) {
      const savedStep = steps[savedStepIndex]
      if (savedStep) {
        router.replace(`/create/${savedStep.id}`)
      }
    }
    hasRedirected.current = true
  }, [stepIndexFromUrl, savedStepIndex, isPathForChooseProtocol, isPathForLoadPoolInit, router])

  // Sync localStorage from URL when URL has a valid step (persists progress)
  useEffect(() => {
    if (stepIndexFromUrl !== null && stepIndexFromUrl !== savedStepIndex) {
      setSavedStepIndex(stepIndexFromUrl)
    }
  }, [stepIndexFromUrl, savedStepIndex, setSavedStepIndex])

  const navigateToStep = (stepIndex: number) => {
    const step = steps[stepIndex]
    if (step) {
      router.push(`/create/${step.id}`)
      scrollToTop()
    }
  }

  const getStepPath = (index: number) => steps[index] && `/create/${steps[index].id}`
  const nextStepPath = getStepPath(currentStepIndex + 1)
  const previousStepPath = getStepPath(currentStepIndex - 1)

  const lastStep = () => {
    navigateToStep(steps.length - 1)
  }

  const resetSteps = () => {
    router.replace(`/create/${steps[0].id}`)
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) {
      navigateToStep(stepIndex)
    }
  }

  const nextStep = () => {
    navigateToStep(currentStepIndex + 1)
  }

  const previousStep = () => {
    navigateToStep(currentStepIndex - 1)
  }

  const isBeforeStep = (stepTitle: string) => {
    const stepIndex = steps.findIndex(step => step.title === stepTitle)
    return currentStepIndex < stepIndex
  }

  const isStep = (stepTitle: string) => {
    return currentStep.title === stepTitle
  }

  return {
    steps,
    currentStepIndex,
    isLastStep,
    isFirstStep,
    currentStep,
    isBeforeStep,
    isStep,
    nextStepPath,
    previousStepPath,
    nextStep,
    previousStep,
    lastStep,
    resetSteps,
    goToStep,
  }
}
