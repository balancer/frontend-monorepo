import { usePathname, useRouter } from 'next/navigation'
import { useLocalStorage } from 'usehooks-ts'
import { useEffect } from 'react'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'

const scrollToTop = () => {
  window.scrollTo(0, 0)
}

const steps = [
  { id: 'step-1-type', title: 'Type' },
  { id: 'step-2-tokens', title: 'Tokens' },
  { id: 'step-3-details', title: 'Details' },
  { id: 'step-4-fund', title: 'Fund' },
]

function getStepIndexFromPathname(pathname: string): number | null {
  const slug = pathname.split('/create/')[1]
  if (!slug) return null
  const stepIndex = steps.findIndex(step => step.id === slug)
  return stepIndex >= 0 ? stepIndex : null
}

export function usePoolCreationFormSteps() {
  const pathname = usePathname()
  const router = useRouter()
  const [savedStepIndex, setSavedStepIndex] = useLocalStorage(LS_KEYS.PoolCreation.StepIndex, 0)

  const stepIndexFromUrl = getStepIndexFromPathname(pathname)
  const hasValidUrlStep = stepIndexFromUrl !== null
  const activeStepIndex = hasValidUrlStep ? stepIndexFromUrl : savedStepIndex

  const isLastStep = activeStepIndex === steps.length - 1
  const isFirstStep = activeStepIndex === 0
  const activeStep = steps[activeStepIndex]

  // Redirect to saved step when landing on /create without a step slug
  useEffect(() => {
    if (!hasValidUrlStep && savedStepIndex > 0) {
      const step = steps[savedStepIndex]
      if (step) {
        router.replace(`/create/${step.id}`)
      }
    }
  }, [hasValidUrlStep, savedStepIndex, router])

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
    navigateToStep(activeStepIndex + 1)
  }

  const previousStep = () => {
    navigateToStep(activeStepIndex - 1)
  }

  const lastStep = () => {
    navigateToStep(steps.length - 1)
  }

  const resetSteps = () => {
    setSavedStepIndex(0)
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex < activeStepIndex) {
      navigateToStep(stepIndex)
    }
  }

  const isBeforeStep = (stepTitle: string) => {
    const stepIndex = steps.findIndex(step => step.title === stepTitle)
    return activeStepIndex < stepIndex
  }

  const isStep = (stepTitle: string) => {
    return activeStep.title === stepTitle
  }

  return {
    steps,
    activeStepIndex,
    isLastStep,
    isFirstStep,
    activeStep,
    isBeforeStep,
    isStep,
    previousStep,
    nextStep,
    lastStep,
    resetSteps,
    goToStep,
  }
}
