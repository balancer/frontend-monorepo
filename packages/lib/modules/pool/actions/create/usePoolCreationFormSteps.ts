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

  const setActiveStep = (step: number) => {
    setActiveStepIndex(step)
  }

  return {
    steps,
    activeStepIndex,
    setActiveStep,
    isLastStep,
    isFirstStep,
    activeStep,
  }
}
