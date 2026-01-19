import { usePathname, useRouter } from 'next/navigation'
import { useLocalStorage } from 'usehooks-ts'
import { ComponentType, useEffect, useRef } from 'react'

const scrollToTop = () => {
  window.scrollTo(0, 0)
}

export interface FormStep {
  id: string
  title: string
  Component: ComponentType
}

export interface UseFormStepsConfig {
  steps: FormStep[]
  basePath: string
  localStorageKey: string
  shouldSkipRedirect?: boolean
}

function getStepIndexFromPathname(pathname: string, steps: FormStep[]): number | null {
  const index = steps.findIndex(step => pathname.endsWith(step.id))
  return index >= 0 ? index : null
}

export function useFormSteps(config: UseFormStepsConfig) {
  const { steps, basePath, localStorageKey, shouldSkipRedirect = false } = config

  const pathname = usePathname()
  const router = useRouter()
  const [savedStepIndex, setSavedStepIndex] = useLocalStorage(localStorageKey, 0)

  const stepIndexFromUrl = getStepIndexFromPathname(pathname, steps)

  // URL drives current step; localStorage is fallback for initial load only
  const currentStepIndex = stepIndexFromUrl ?? savedStepIndex

  const isLastStep = currentStepIndex === steps.length - 1
  const isFirstStep = currentStepIndex === 0
  const currentStep = steps[currentStepIndex]

  // On initial load without valid URL step, redirect to saved step from localStorage
  const hasRedirected = useRef(false)
  useEffect(() => {
    if (hasRedirected.current || shouldSkipRedirect) return
    if (stepIndexFromUrl === null) {
      const savedStep = steps[savedStepIndex]
      if (savedStep) {
        router.replace(`${basePath}/${savedStep.id}`)
      }
    }
    hasRedirected.current = true
  }, [stepIndexFromUrl, savedStepIndex, shouldSkipRedirect, router, basePath, steps])

  // Sync localStorage from URL when URL has a valid step (persists progress)
  useEffect(() => {
    if (stepIndexFromUrl !== null && stepIndexFromUrl !== savedStepIndex) {
      setSavedStepIndex(stepIndexFromUrl)
    }
  }, [stepIndexFromUrl, savedStepIndex, setSavedStepIndex])

  const navigateToStep = (stepIndex: number) => {
    const step = steps[stepIndex]
    if (step) {
      router.push(`${basePath}/${step.id}`)
      scrollToTop()
    }
  }

  const getStepPath = (index: number) => steps[index] && `${basePath}/${steps[index].id}`
  const nextStepPath = getStepPath(currentStepIndex + 1)
  const previousStepPath = getStepPath(currentStepIndex - 1)

  const goToNextStep = () => {
    navigateToStep(currentStepIndex + 1)
  }

  const goToPreviousStep = () => {
    navigateToStep(currentStepIndex - 1)
  }

  const goToLastStep = () => {
    navigateToStep(steps.length - 1)
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) {
      navigateToStep(stepIndex)
    }
  }

  const resetSteps = () => {
    setSavedStepIndex(0)
    router.replace(`${basePath}/${steps[0].id}`)
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
    currentStep,
    isLastStep,
    isFirstStep,
    nextStepPath,
    previousStepPath,
    goToNextStep,
    goToPreviousStep,
    goToLastStep,
    goToStep,
    resetSteps,
    isBeforeStep,
    isStep,
  }
}
