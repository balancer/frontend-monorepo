import { useBindTokenStep } from './useBindTokenStep'
import { useSetSwapFeeStep } from './useSetSwapFeeStep'
import { useFinalizeStep } from './useFinalizeStep'
import { ExtendedInitPoolInput } from '../../types'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolType } from '@balancer/sdk'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { useLocalStorage } from 'usehooks-ts'
import { Address } from 'viem'

interface UseCreateCowStepsParams {
  initPoolInput: ExtendedInitPoolInput
  network: GqlChain
  poolType: PoolType
}

export function useCreateCowSteps({ initPoolInput, network, poolType }: UseCreateCowStepsParams) {
  const [poolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.PoolCreation.Address,
    undefined
  )

  const { amountsIn } = initPoolInput
  const txConfig = { network, poolType, poolAddress }

  // cow pool will always be exactly 2 tokens
  const [token0, token1] = amountsIn

  const { step: bindToken0Step, isLoading: isLoadingBindToken0 } = useBindTokenStep({
    token: token0!,
    ...txConfig,
  })

  const { step: bindToken1Step, isLoading: isLoadingBindToken1 } = useBindTokenStep({
    token: token1!,
    ...txConfig,
  })

  const { setSwapFeeStep, isLoadingSetSwapFeeStep } = useSetSwapFeeStep(txConfig)

  const { finalizeStep, isLoadingFinalizeStep } = useFinalizeStep(txConfig)

  const finishCowSteps = [bindToken0Step, bindToken1Step, setSwapFeeStep, finalizeStep]

  const isLoadingFinishCowSteps =
    isLoadingBindToken0 || isLoadingBindToken1 || isLoadingSetSwapFeeStep || isLoadingFinalizeStep

  return { finishCowSteps, isLoadingFinishCowSteps }
}
