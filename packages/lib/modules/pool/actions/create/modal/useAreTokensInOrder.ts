import { usePoolCreationForm } from '../PoolCreationFormProvider'

export function useAreTokensInOrder() {
  const { poolTokens } = usePoolCreationForm()

  if (!poolTokens[0]?.address || !poolTokens[1]?.address) {
    throw new Error('Pool token addresses missing for pool creation')
  }

  return poolTokens[0]?.address?.toLowerCase() < poolTokens[1]?.address?.toLowerCase()
}
