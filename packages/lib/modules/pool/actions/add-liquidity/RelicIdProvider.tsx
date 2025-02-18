'use client'

import { useOptionalContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'

interface RelicIdContextType {
  relicId?: string
}

const RelicIdContext = createContext<RelicIdContextType | null>(null)

export function RelicIdProvider({ children, relicId }: PropsWithChildren<{ relicId?: string }>) {
  return <RelicIdContext.Provider value={{ relicId }}>{children}</RelicIdContext.Provider>
}

export function useRelicId() {
  const context = useOptionalContext(RelicIdContext)
  return context || { relicId: undefined }
}
