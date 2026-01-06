'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext, useCallback, useState } from 'react'
import { Address } from 'viem'
import { ApiOrCustomToken } from './token.types'

export function useTokenInputsValidationLogic() {
  type ValidationErrorsByToken = Record<Address, string>
  const [validationErrors, setValidationErrors] = useState<ValidationErrorsByToken>({})

  const setValidationError = useCallback((tokenAddress: Address, value: string) => {
    setValidationErrors(prev => {
      if (prev[tokenAddress] === value) return prev
      return { ...prev, [tokenAddress]: value }
    })
  }, [])

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

  // As we are using state to store the errors, those are not checked in a centralized place
  // and we used to use a pattern of removing the errors and then calculating them, we had the
  // problem that errors could disappear on page refresh. We have moved to a new pattern of
  // only removing the errors being rechecked that, although probably more complicated
  // than it should be, should work for now.
  function removeValidationErrors(tokenAddress: Address, errors: string[]) {
    if (errors.includes(validationErrors[tokenAddress])) setValidationError(tokenAddress, '')
  }

  return {
    setValidationError,
    getValidationError,
    removeValidationErrors,
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
