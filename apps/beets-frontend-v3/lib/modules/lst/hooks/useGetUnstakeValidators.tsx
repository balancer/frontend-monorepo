/* eslint-disable react-hooks/exhaustive-deps */
import { useGetAmountDelegatedPerValidator } from '@/lib/modules/lst/hooks/useGetAmountDelegatedPerValidator'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useState, useEffect, useCallback } from 'react'
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
  const [validators, setValidators] = useState<ValidatorUnstakeData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { chooseValidatorsForUnstakeAmount } = useGetAmountDelegatedPerValidator(chain)

  const fetchValidators = useCallback(async () => {
    if (!sharesAmount || !unstakeEnabled) {
      return
    }

    const amountScaled = parseUnits(sharesAmount, 18)

    setIsLoading(true)
    setError(null)

    try {
      const apiUrl = `https://sts-helper.beets-ftm-node.com/api/unstake-recommendation?amount=${amountScaled.toString()}`

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const responseData: ApiValidatorResponse = await response.json()

      if (!responseData.data || responseData.data.length === 0) {
        throw new Error('No data received from API')
      }

      const transformedData: ValidatorUnstakeData[] = responseData.data.map(item => ({
        validatorId: item.validatorId,
        unstakeAmountShares: item.withdrawalAmount,
      }))

      setValidators(transformedData)
      setError(null)
    } catch (err) {
      // Fallback to chooseValidatorsForUnstakeAmount when API fails
      console.error('Failed to fetch validators from API, using fallback:', err)
      const fallbackValidators = chooseValidatorsForUnstakeAmount(amountScaled)
      setValidators(fallbackValidators)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [sharesAmount, unstakeEnabled, chooseValidatorsForUnstakeAmount])

  useEffect(() => {
    fetchValidators()
  }, [sharesAmount, unstakeEnabled])

  return {
    validators: validators,
    isLoading,
    error,
    refetch: fetchValidators,
  }
}
