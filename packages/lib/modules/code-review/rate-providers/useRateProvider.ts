import { useRateProvidersQuery } from './useRateProvidersQuery'
import { Address } from 'viem'

export function useRateProvider() {
  const { data: rateProvidersCodeReviewData, isLoading, error } = useRateProvidersQuery()

  function getRateProvider(rateProviderAddress: Address) {
    return rateProvidersCodeReviewData?.find(
      rateProvider => rateProvider.address.toLowerCase() === rateProviderAddress.toLowerCase()
    )
  }

  const isConstantRateProvider = (rateProviderAddress: Address) =>
    getRateProvider(rateProviderAddress)?.name.toLowerCase().includes('constant')

  const isDynamicRateProvider = (rateProviderAddress: Address) =>
    getRateProvider(rateProviderAddress)?.name.toLowerCase().includes('dynamic')

  return {
    loading: isLoading,
    error,
    isConstantRateProvider,
    isDynamicRateProvider,
  }
}
