import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'

const steps = [
  { id: 'step1', title: 'Type' },
  { id: 'step2', title: 'Tokens' },
  { id: 'step3', title: 'Details' },
  { id: 'step4', title: 'Fund' },
]

export function usePoolCreationFormSteps() {
  const [activeStepIndex, setActiveStepIndex] = useLocalStorage(LS_KEYS.PoolCreation.StepIndex, 0)

  const isLastStep = activeStepIndex === steps.length - 1
  const isFirstStep = activeStepIndex === 0
  const activeStep = steps[activeStepIndex]

  const nextStep = () => {
    setActiveStepIndex(activeStepIndex + 1)
  }

  const previousStep = () => {
    setActiveStepIndex(activeStepIndex - 1)
  }

  const lastStep = () => {
    setActiveStepIndex(steps.length - 1)
  }

  const resetSteps = () => {
    setActiveStepIndex(0)
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
  }
}
