import { useCreatePoolStep } from './useCreatePoolStep'

export function usePoolCreationSteps() {
  const createPoolStep = useCreatePoolStep()

  return {
    steps: [createPoolStep],
    isLoadingSteps: false,
  }
}
