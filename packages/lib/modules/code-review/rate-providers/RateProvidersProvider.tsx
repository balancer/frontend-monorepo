'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { RateProvidersCodeReviewData } from './getRateProvidersCodeReviewData'

export type UseRateProvidersResult = ReturnType<typeof useRateProvidersLogic>
export const RateProvidersContext = createContext<UseRateProvidersResult | null>(null)

export function useRateProvidersLogic(codeReviewData: RateProvidersCodeReviewData[] | undefined) {
  return { codeReviewData }
}

export function RateProvidersProvider({
  children,
  data,
}: PropsWithChildren & { data: RateProvidersCodeReviewData[] | undefined }) {
  const hook = useRateProvidersLogic(data)
  return <RateProvidersContext.Provider value={hook}>{children}</RateProvidersContext.Provider>
}

export const useRateProviders = (): UseRateProvidersResult =>
  useMandatoryContext(RateProvidersContext, 'RateProviders')
