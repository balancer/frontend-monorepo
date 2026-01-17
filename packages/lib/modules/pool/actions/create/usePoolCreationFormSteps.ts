import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useLocalStorage } from 'usehooks-ts'
import { ComponentType, useEffect } from 'react'
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

export function usePoolCreationFormSteps() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [savedStepIndex, setSavedStepIndex] = useLocalStorage(LS_KEYS.PoolCreation.StepIndex, 0)

  const stepIndexFromUrl = getStepIndexFromPathname(pathname)
  const hasValidUrlStep = stepIndexFromUrl !== null
  const currentStepIndex = hasValidUrlStep ? stepIndexFromUrl : savedStepIndex
  const hasProtocolParam = searchParams.has('protocol')

  const isLastStep = currentStepIndex === steps.length - 1
  const isFirstStep = currentStepIndex === 0
  const currentStep = steps[currentStepIndex]

  // Redirect to saved step when landing on /create without a step slug
  // Skip redirect if protocol param is present - let useProtocolSearchParams handle that flow
  useEffect(() => {
    if (!hasValidUrlStep && savedStepIndex > 0 && !hasProtocolParam) {
      const step = steps[savedStepIndex]
      if (step) {
        router.replace(`/create/${step.id}`)
      }
    }
  }, [hasValidUrlStep, savedStepIndex, hasProtocolParam, router])

  // Keep localStorage in sync when URL changes
  useEffect(() => {
    if (hasValidUrlStep && stepIndexFromUrl !== savedStepIndex) {
      setSavedStepIndex(stepIndexFromUrl)
    }
  }, [hasValidUrlStep, stepIndexFromUrl, savedStepIndex, setSavedStepIndex])

  const navigateToStep = (stepIndex: number) => {
    const step = steps[stepIndex]
    if (step) {
      router.push(`/create/${step.id}`)
      scrollToTop()
    }
  }

  const nextStep = () => {
    navigateToStep(currentStepIndex + 1)
  }

  const previousStep = () => {
    navigateToStep(currentStepIndex - 1)
  }

  const lastStep = () => {
    navigateToStep(steps.length - 1)
  }

  const resetSteps = () => {
    setSavedStepIndex(0)
    router.replace(`/create/${steps[0].id}`)
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) {
      navigateToStep(stepIndex)
    }
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
    previousStep,
    nextStep,
    lastStep,
    resetSteps,
    goToStep,
  }
}
