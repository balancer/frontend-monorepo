import { useGetAmountDelegatedPerValidator } from '@/lib/modules/lst/hooks/useGetAmountDelegatedPerValidator'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@tanstack/react-query'
import { minutesToMilliseconds } from 'date-fns'
import { parseUnits } from 'viem'

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

export function useGetUnstakeValidators(
  sharesAmount: string,
  chain: GqlChain,
  unstakeEnabled: boolean
) {
  const { chooseValidatorsForUnstakeAmount } = useGetAmountDelegatedPerValidator(chain)

  const queryResult = useQuery({
    queryKey: ['unstake-validators', sharesAmount, chain],
    queryFn: async () => {
      if (!sharesAmount) {
        return []
      }

      const amountScaled = parseUnits(sharesAmount, 18)
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
    enabled: !!sharesAmount && unstakeEnabled,
    staleTime: minutesToMilliseconds(5),
    retry: 1,
  })

  // Return fallback data when API fails
  const validators = queryResult.data ?? []

  // If query failed and we have no data, use fallback
  if (queryResult.isError && validators.length === 0 && sharesAmount && unstakeEnabled) {
    const amountScaled = parseUnits(sharesAmount, 18)
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
