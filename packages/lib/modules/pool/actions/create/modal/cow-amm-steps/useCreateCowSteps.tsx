import { ExtendedInitPoolInputV3 } from '../../types'
import { useBindTokenStep } from './useBindTokenStep'
import { useSetSwapFeeStep } from './useSetSwapFeeStep'
import { useFinalizeStep } from './useFinalizeStep'
import { Address } from 'viem'

type useCreateCowStepsParams = {
  initPoolInput: ExtendedInitPoolInputV3
  poolAddress: Address | undefined
}

export function useCreateCowSteps({ initPoolInput, poolAddress }: useCreateCowStepsParams) {
  const { amountsIn, chainId } = initPoolInput

  // cow pool will always be only 2 tokens
  const { step: bindToken0Step, isLoading: isLoadingBindToken0 } = useBindTokenStep({
    token: amountsIn[0],
    chainId,
    poolAddress,
  })
  const { step: bindToken1Step, isLoading: isLoadingBindToken1 } = useBindTokenStep({
    token: amountsIn[1],
    chainId,
    poolAddress,
  })
  const { step: setSwapFeeStep, isLoading: isLoadingSetSwapFee } = useSetSwapFeeStep({
    poolAddress,
    chainId,
  })
  const { step: finalizeStep, isLoading: isLoadingFinalize } = useFinalizeStep({
    poolAddress,
    chainId,
  })

  const steps = [bindToken0Step, bindToken1Step, setSwapFeeStep, finalizeStep]

  const isLoading =
    isLoadingBindToken0 || isLoadingBindToken1 || isLoadingSetSwapFee || isLoadingFinalize

  return { steps, isLoading }
}
