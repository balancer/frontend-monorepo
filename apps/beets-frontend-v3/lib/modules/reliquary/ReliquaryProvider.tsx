/* eslint-disable max-len */
'use client'

import { useState, PropsWithChildren, createContext } from 'react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { GqlChain, GqlPoolSnapshotDataRange } from '@repo/lib/shared/services/api/generated/graphql'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { LABELS } from '@repo/lib/shared/labels'
import { isDisabledWithReason } from '@repo/lib/shared/utils/functions/isDisabledWithReason'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useLevelUpStep } from './hooks/useLevelUpStep'
import { ReliquaryPosition } from './reliquary.types'

const CHAIN = GqlChain.Sonic

export function _useReliquary() {
  const { isConnected } = useUserAccount()
  const { hasValidationError, getValidationError } = useTokenInputsValidation()
  const [range, setRange] = useState<GqlPoolSnapshotDataRange>(GqlPoolSnapshotDataRange.ThirtyDays)
  const [selectedRelic, setSelectedRelic] = useState<ReliquaryPosition | undefined>(undefined)

  const disabledConditions: [boolean, string][] = [[!isConnected, LABELS.walletNotConnected]]
  const { isDisabled, disabledReason } = isDisabledWithReason(...disabledConditions)

  const { step: levelUpStep } = useLevelUpStep(CHAIN, selectedRelic?.relicId)
  const levelUpTransactionSteps = useTransactionSteps([levelUpStep], false)
  const levelUpTxHash = levelUpTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const levelUpTxConfirmed = levelUpTransactionSteps.lastTransactionConfirmed

  return {
    chain: CHAIN,
    isDisabled,
    disabledReason,
    hasValidationError,
    getValidationError,
    range,
    setRange,
    selectedRelic,
    setSelectedRelic,
    levelUpTransactionSteps,
    levelUpTxHash,
    levelUpTxConfirmed,
  }
}

export type Result = ReturnType<typeof _useReliquary>
export const ReliquaryContext = createContext<Result | null>(null)

export function ReliquaryProvider({ children }: PropsWithChildren) {
  const Reliquary = _useReliquary()

  return <ReliquaryContext.Provider value={Reliquary}>{children}</ReliquaryContext.Provider>
}

export const useReliquary = (): Result => useMandatoryContext(ReliquaryContext, 'Reliquary')
