import { useQuery } from '@tanstack/react-query'
import {
  getRateProvidersCodeReviewData,
  RateProvidersCodeReviewData,
} from './getRateProvidersCodeReviewData'

export type UseRateProvidersQueryResult = ReturnType<typeof useRateProvidersQuery>

export function useRateProvidersQuery(options?: {
  enabled?: boolean
  staleTimeMs?: number
  gcTimeMs?: number
}) {
  return useQuery<RateProvidersCodeReviewData[] | undefined>({
    queryKey: ['rate-providers', 'code-review'],
    queryFn: getRateProvidersCodeReviewData,
    staleTime: options?.staleTimeMs ?? 15 * 60 * 1000, // 15 minutes
    gcTime: options?.gcTimeMs ?? 60 * 60 * 1000, // 1 hour
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
