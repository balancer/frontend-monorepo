'use client'

import { GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@/lib/shared/utils/contexts'
import { PropsWithChildren, createContext, useState } from 'react'
import { Address } from 'viem'

export function _useTokenInputsValidation() {
  type ValidationErrorsByToken = Record<Address, string>
  const [validationErrors, setValidationErrors] = useState<ValidationErrorsByToken>({})

  function setValidationError(tokenAddress: Address, value: string) {
    validationErrors[tokenAddress] = value
    setValidationErrors({ ...validationErrors })
  }

  function hasValidationError(token: GqlToken | undefined) {
    return !!getValidationError(token)
  }

  function getValidationError(token: GqlToken | undefined): string {
    if (!token) return ''
    const error = validationErrors[token.address as Address]
    if (!error) return ''
    return error
  }

  const hasValidationErrors = Object.values(validationErrors).some(error => error !== '')

  return { setValidationError, getValidationError, hasValidationError, hasValidationErrors }
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
