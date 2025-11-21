'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext, useState } from 'react'
import { Address } from 'viem'
import { ApiOrCustomToken } from './token.types'

export function useTokenInputsValidationLogic() {
  type ValidationErrorsByToken = Record<Address, string>
  const [validationErrors, setValidationErrors] = useState<ValidationErrorsByToken>({})

  function setValidationError(tokenAddress: Address, value: string) {
    setValidationErrors({ ...validationErrors, [tokenAddress]: value })
  }

  function hasValidationError(token: ApiOrCustomToken | undefined) {
    return !!getValidationError(token)
  }

  function getValidationError(token: ApiOrCustomToken | undefined): string {
    if (!token) return ''
    const error = validationErrors[token.address as Address]
    if (!error) return ''
    return error
  }

  function resetValidationErrors() {
    setValidationErrors({})
  }

  const hasValidationErrors = Object.values(validationErrors).some(error => error !== '')

  return {
    setValidationError,
    getValidationError,
    hasValidationError,
    hasValidationErrors,
    resetValidationErrors,
  }
}

export type Result = ReturnType<typeof useTokenInputsValidationLogic>
export const TokenValidationContext = createContext<Result | null>(null)

export function TokenInputsValidationProvider({ children }: PropsWithChildren) {
  const validation = useTokenInputsValidationLogic()

  return (
    <TokenValidationContext.Provider value={validation}>{children}</TokenValidationContext.Provider>
  )
}

export const useTokenInputsValidation = (): Result =>
  useMandatoryContext(TokenValidationContext, 'TokenInputsValidation')
