/* eslint-disable max-len */
'use client'

import { useState, PropsWithChildren, createContext } from 'react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { GqlChain, GqlPoolSnapshotDataRange } from '@repo/lib/shared/services/api/generated/graphql'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { LABELS } from '@repo/lib/shared/labels'
import { isDisabledWithReason } from '@repo/lib/shared/utils/functions/isDisabledWithReason'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'

const CHAIN = GqlChain.Sonic

export function _useReliquary() {
  const { isConnected } = useUserAccount()
  const { hasValidationError, getValidationError } = useTokenInputsValidation()
  const [range, setRange] = useState<GqlPoolSnapshotDataRange>(GqlPoolSnapshotDataRange.ThirtyDays)

  const disabledConditions: [boolean, string][] = [[!isConnected, LABELS.walletNotConnected]]

  const { isDisabled, disabledReason } = isDisabledWithReason(...disabledConditions)

  return {
    chain: CHAIN,
    isDisabled,
    disabledReason,
    hasValidationError,
    getValidationError,
    range,
    setRange,
  }
}

export type Result = ReturnType<typeof _useReliquary>
export const ReliquaryContext = createContext<Result | null>(null)

export function ReliquaryProvider({ children }: PropsWithChildren) {
  const Reliquary = _useReliquary()

  return <ReliquaryContext.Provider value={Reliquary}>{children}</ReliquaryContext.Provider>
}

export const useReliquary = (): Result => useMandatoryContext(ReliquaryContext, 'Reliquary')
