import { usePathname, useRouter } from 'next/navigation'
import { useLocalStorage } from 'usehooks-ts'
import { ComponentType, useEffect, useRef } from 'react'
import { isAddress } from 'viem'

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
  canRenderStepFn: (currentStepIndex: number) => boolean
  isFormHydrated: boolean
  shouldSkipRedirectToSavedStep: boolean
}

function getStepIndexFromPathname(pathname: string, steps: FormStep[]): number | null {
  const index = steps.findIndex(step => pathname.endsWith(step.id))
  return index >= 0 ? index : null
}

export function useFormSteps(config: UseFormStepsConfig) {
  const {
    steps,
    basePath,
    localStorageKey,
    canRenderStepFn,
    isFormHydrated,
    shouldSkipRedirectToSavedStep,
  } = config

  const pathname = usePathname()
  const lastSegment = pathname.split('/').pop() ?? ''
  const isPathForLoadingPool = isAddress(lastSegment)
  const shouldRedirectToSavedStep = !isPathForLoadingPool && !shouldSkipRedirectToSavedStep

  const router = useRouter()
  const [savedStepIndex, setSavedStepIndex] = useLocalStorage(localStorageKey, 0)

  const stepIndexFromUrl = getStepIndexFromPathname(pathname, steps)

  // URL drives current step; localStorage is fallback for initial load only
  const currentStepIndex = stepIndexFromUrl ?? savedStepIndex

  const isLastStep = currentStepIndex === steps.length - 1
  const isFirstStep = currentStepIndex === 0
  const currentStep = steps[currentStepIndex]
  const canRenderStep = isFormHydrated && canRenderStepFn(currentStepIndex)

  // On initial load without valid URL step, redirect to saved step from localStorage
  const hasRedirected = useRef(false)
  useEffect(() => {
    if (hasRedirected.current || !shouldRedirectToSavedStep) return
    if (stepIndexFromUrl === null) {
      const savedStep = steps[savedStepIndex]
      if (savedStep) {
        router.replace(`${basePath}/${savedStep.id}`)
      }
    }
    hasRedirected.current = true
  }, [stepIndexFromUrl, savedStepIndex, shouldRedirectToSavedStep, router, basePath, steps])

  useEffect(() => {
    if (!isFormHydrated) return
    // if render attempt would crash page, redirect to first step
    if (!canRenderStep) router.replace(`${basePath}/${steps[0]?.id || ''}`)
    const shouldSyncLocalStorage = stepIndexFromUrl !== null && stepIndexFromUrl !== savedStepIndex
    if (shouldSyncLocalStorage) setSavedStepIndex(stepIndexFromUrl)
  }, [stepIndexFromUrl, savedStepIndex, setSavedStepIndex, isFormHydrated, canRenderStep])

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
    router.replace(`${basePath}/${steps[0]?.id || ''}`)
  }

  const isBeforeStep = (stepTitle: string) => {
    const stepIndex = steps.findIndex(step => step.title === stepTitle)
    return currentStepIndex < stepIndex
  }

  const isStep = (stepTitle: string) => {
    return currentStep?.title === stepTitle
  }

  return {
    steps,
    canRenderStep,
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
