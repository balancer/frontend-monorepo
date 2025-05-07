/* eslint-disable react-hooks/rules-of-hooks */

'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext, useState } from 'react'
import { Address } from 'viem'
import { ApiToken } from './token.types'

export function _useTokenInputsValidation() {
  type ValidationErrorsByToken = Record<Address, string>
  const [validationErrors, setValidationErrors] = useState<ValidationErrorsByToken>({})

  function setValidationError(tokenAddress: Address, value: string) {
    validationErrors[tokenAddress] = value
    setValidationErrors({ ...validationErrors })
  }

  function hasValidationError(token: ApiToken | undefined) {
    return !!getValidationError(token)
  }

  function getValidationError(token: ApiToken | undefined): string {
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

export type Result = ReturnType<typeof _useTokenInputsValidation>
export const TokenValidationContext = createContext<Result | null>(null)

export function TokenInputsValidationProvider({ children }: PropsWithChildren) {
  const validation = _useTokenInputsValidation()

  return (
    <TokenValidationContext.Provider value={validation}>{children}</TokenValidationContext.Provider>
  )
}

export const useTokenInputsValidation = (): Result =>
  useMandatoryContext(TokenValidationContext, 'TokenInputsValidation')
