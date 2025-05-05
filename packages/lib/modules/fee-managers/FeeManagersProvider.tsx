'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { FeeManagersMetadata } from './getFeeManagersMetadata'

export type UseFeeManagersResult = ReturnType<typeof _useFeeManagers>
export const FeeManagersContext = createContext<UseFeeManagersResult | null>(null)

export function _useFeeManagers(metadata: FeeManagersMetadata[] | undefined) {
  return { metadata }
}

export function FeeManagersProvider({
  children,
  data,
}: PropsWithChildren & { data: FeeManagersMetadata[] | undefined }) {
  const hook = _useFeeManagers(data)
  return <FeeManagersContext.Provider value={hook}>{children}</FeeManagersContext.Provider>
}

export const useFeeManagers = (): UseFeeManagersResult =>
  useMandatoryContext(FeeManagersContext, 'FeeManagers')
