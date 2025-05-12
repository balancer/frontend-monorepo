'use client'

import { GetProtocolStatsQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'

export type UseProtocolStatsResult = ReturnType<typeof useProtocolStatsLogic>
export const ProtocolStatsContext = createContext<UseProtocolStatsResult | null>(null)

export function useProtocolStatsLogic(data: GetProtocolStatsQuery | undefined) {
  return { protocolData: data }
}

export function ProtocolStatsProvider({
  children,
  data,
}: PropsWithChildren & { data: GetProtocolStatsQuery | undefined }) {
  const hook = useProtocolStatsLogic(data)
  return <ProtocolStatsContext.Provider value={hook}>{children}</ProtocolStatsContext.Provider>
}

export const useProtocolStats = (): UseProtocolStatsResult =>
  useMandatoryContext(ProtocolStatsContext, 'ProtocolStats')
