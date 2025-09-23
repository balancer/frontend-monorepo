import { useRateProviders } from './RateProvidersProvider'
import { Address } from 'viem'

export function useRateProvider(rateProviderAddress: Address) {
  const { codeReviewData: rateProvidersCodeReviewData } = useRateProviders()

  const rateProvider = rateProvidersCodeReviewData?.find(
    rateProvider => rateProvider.address.toLowerCase() === rateProviderAddress.toLowerCase()
  )

  const isConstantRateProvider = rateProvider?.review.includes('constant')
  const isDynamicRateProvider = rateProvider?.review.includes('dynamic')

  return {
    rateProvider,
    isConstantRateProvider,
    isDynamicRateProvider,
  }
}
