import { useCreateLbpStep } from './useCreateLbpStep'

export function useCreateLbpSteps() {
  const createLbpStep = useCreateLbpStep()

  return {
    isLoadingSteps: false,
    steps: [createLbpStep],
  }
}
