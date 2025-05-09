'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { HooksMetadata } from './getHooksMetadata'

export type UseHooksResult = ReturnType<typeof useHooksLogic>
export const HooksContext = createContext<UseHooksResult | null>(null)

export function useHooksLogic(metadata: HooksMetadata[] | undefined) {
  return { metadata }
}

export function HooksProvider({
  children,
  data,
}: PropsWithChildren & { data: HooksMetadata[] | undefined }) {
  const hook = useHooksLogic(data)
  return <HooksContext.Provider value={hook}>{children}</HooksContext.Provider>
}

export const useHooks = (): UseHooksResult => useMandatoryContext(HooksContext, 'Hooks')
