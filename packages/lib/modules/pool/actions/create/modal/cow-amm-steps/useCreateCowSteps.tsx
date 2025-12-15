import { ExtendedInitPoolInputV3 } from '../../types'
import { useBindTokenStep } from './useBindTokenStep'
import { useSetSwapFeeStep } from './useSetSwapFeeStep'
import { useFinalizeStep } from './useFinalizeStep'

export function useCreateCowSteps(initPoolInput: ExtendedInitPoolInputV3) {
  const { amountsIn } = initPoolInput

  // cow pool will always be exactly 2 tokens
  const { step: bindToken0Step, isLoading: isLoadingBindToken0 } = useBindTokenStep(amountsIn[0])
  const { step: bindToken1Step, isLoading: isLoadingBindToken1 } = useBindTokenStep(amountsIn[1])

  const { setSwapFeeStep, isLoadingSetSwapFeeStep } = useSetSwapFeeStep()

  const { finalizeStep, isLoadingFinalizeStep } = useFinalizeStep()

  const finishCowSteps = [bindToken0Step, bindToken1Step, setSwapFeeStep, finalizeStep]

  const isLoadingFinishCowSteps =
    isLoadingBindToken0 || isLoadingBindToken1 || isLoadingSetSwapFeeStep || isLoadingFinalizeStep

  return { finishCowSteps, isLoadingFinishCowSteps }
}
