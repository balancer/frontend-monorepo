import { useGetAmountDelegatedPerValidator } from '@/lib/modules/lst/hooks/useGetAmountDelegatedPerValidator'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@tanstack/react-query'
import { minutesToMilliseconds } from 'date-fns'
import { parseAmount } from '@repo/lib/shared/utils/numbers'

interface ApiValidatorResponse {
  data: Array<{
    withdrawalAmount: bigint
    validatorId: string
  }>
}

export interface ValidatorUnstakeData {
  validatorId: string
  unstakeAmountShares: bigint
}

// Amount fields hold transient states ('', '.', '-') and pasted junk that parseAmount rejects.
// Neither is a real unstake, so return null and let callers skip the request instead of asking
// the API for amount=0 or letting a parse error escape into render.
function parseSharesAmount(sharesAmount: string): bigint | null {
  try {
    const amountScaled = parseAmount(sharesAmount, 18)
    return amountScaled > 0n ? amountScaled : null
  } catch {
    return null
  }
}

export function useGetUnstakeValidators(
  sharesAmount: string,
  chain: GqlChain,
  unstakeEnabled: boolean
) {
  const { chooseValidatorsForUnstakeAmount } = useGetAmountDelegatedPerValidator(chain)

  const amountScaled = parseSharesAmount(sharesAmount)

  const queryResult = useQuery({
    queryKey: ['unstake-validators', sharesAmount, chain],
    queryFn: async () => {
      if (amountScaled === null) {
        return []
      }

      const apiUrl = `https://sts-helper.beets-ftm-node.com/api/unstake-recommendation?amount=${amountScaled.toString()}`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const responseData: ApiValidatorResponse = await response.json()

      if (!responseData.data || responseData.data.length === 0) {
        throw new Error('No data received from API')
      }

      return responseData.data.map(item => ({
        validatorId: item.validatorId,
        unstakeAmountShares: item.withdrawalAmount,
      }))
    },
    enabled: amountScaled !== null && unstakeEnabled,
    staleTime: minutesToMilliseconds(5),
    retry: 1,
  })

  // Return fallback data when API fails
  const validators = queryResult.data ?? []

  // If query failed and we have no data, use fallback
  if (queryResult.isError && validators.length === 0 && amountScaled !== null && unstakeEnabled) {
    const fallbackValidators = chooseValidatorsForUnstakeAmount(amountScaled)
    return {
      validators: fallbackValidators,
      isLoading: false,
      error: queryResult.error,
    }
  }

  return {
    validators,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
  }
}
