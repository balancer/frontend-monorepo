import { useBindTokenStep } from './useBindTokenStep'
import { useSetSwapFeeStep } from './useSetSwapFeeStep'
import { useFinalizeStep } from './useFinalizeStep'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { parseUnits } from 'viem'

export function useCreateCowSteps() {
  const { poolCreationForm } = usePoolCreationForm()
  const poolTokens = poolCreationForm.getValues('poolTokens')

  const tokens = poolTokens.map(token => {
    if (!token.address) throw new Error('token address missing for cow creation')
    if (!token?.data?.decimals) throw new Error('token decimals missing for cow creation')
    if (!token?.data?.symbol) throw new Error('token symbol missing for cow creation')
    return {
      address: token.address,
      rawAmount: parseUnits(token.amount, token.data.decimals),
      symbol: token.data.symbol,
      weight: token.weight,
    }
  })

  // cow pool will always be exactly 2 tokens
  const { step: bindToken0Step, isLoading: isLoadingBindToken0 } = useBindTokenStep(tokens[0])
  const { step: bindToken1Step, isLoading: isLoadingBindToken1 } = useBindTokenStep(tokens[1])

  const { setSwapFeeStep, isLoadingSetSwapFeeStep } = useSetSwapFeeStep()

  const { finalizeStep, isLoadingFinalizeStep } = useFinalizeStep()

  const finishCowSteps = [bindToken0Step, bindToken1Step, setSwapFeeStep, finalizeStep]

  const isLoadingFinishCowSteps =
    isLoadingBindToken0 || isLoadingBindToken1 || isLoadingSetSwapFeeStep || isLoadingFinalizeStep

  return { finishCowSteps, isLoadingFinishCowSteps }
}
