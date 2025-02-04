'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext } from 'react'

export type UseLbpFormResult = ReturnType<typeof _useLbpForm>
export const LbpFormContext = createContext<UseLbpFormResult | null>(null)

export function _useLbpForm() {
  return {}
}

export function LbpFormProvider({ children }: PropsWithChildren) {
  const hook = _useLbpForm()
  return <LbpFormContext.Provider value={hook}>{children}</LbpFormContext.Provider>
}

export const useUserSettings = (): UseLbpFormResult =>
  useMandatoryContext(LbpFormContext, 'LbpForm')
