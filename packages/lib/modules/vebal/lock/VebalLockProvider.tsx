'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren, useMemo, useState } from 'react'
import { useVebalToken } from '@repo/lib/modules/tokens/TokensProvider'
import { HumanAmount } from '@balancer/sdk'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { isDisabledWithReason } from '@repo/lib/shared/utils/functions/isDisabledWithReason'
import { useDisclosure } from '@chakra-ui/hooks'
import { useLockDuration } from '@repo/lib/modules/vebal/lock/duration/lock-duration.hooks'
import { useVebalLockInfo } from '@repo/lib/modules/vebal/lock/VebalLockInfoProvider'
import { differenceInSeconds } from 'date-fns'
import { getPreviousThursday, oneYearInSecs } from '@repo/lib/shared/utils/time'
import BigNumber from 'bignumber.js'

export type UseVebalLockResult = ReturnType<typeof _useVebalLock>
export const VebalLockContext = createContext<UseVebalLockResult | null>(null)

export enum LockMode {
  Lock = 'Lock',
  Extend = 'Extend',
  Unlock = 'Unlock',
}

/**
 * @summary Calculate expected veBAL given BPT being locked and lock time in seconds.
 * @param {string} bpt - BPT amount being locked up
 * @param {string} lockDateStr - Date in string format used to create Date of lock
 */
export function expectedVeBal(bpt: string, lockDateStr: string): BigNumber {
  const now = new Date()
  const lockDate = new Date(lockDateStr)
  const previousThursdayBeforeLockDate = getPreviousThursday(lockDate)
  const lockTime = differenceInSeconds(previousThursdayBeforeLockDate, now)

  return bn(bpt).times(lockTime).div(oneYearInSecs)
}

export function _useVebalLock() {
  const vebalToken = useVebalToken()
  if (!vebalToken) throw new Error('vebalBptToken not found')

  const { mainnetLockedInfo, isLoading } = useVebalLockInfo()
  const { hasValidationErrors } = useTokenInputsValidation()

  const [humanAmount, setHumanAmount] = useState<HumanAmount>()

  const amount = bn(humanAmount || 0)

  const totalAmount = useMemo(() => {
    if (mainnetLockedInfo.hasExistingLock) {
      const lockedAmount = bn(mainnetLockedInfo.lockedAmount ?? 0)
      return lockedAmount.plus(amount)
    }
    return amount
  }, [amount, mainnetLockedInfo])

  const lockDuration = useLockDuration({
    lockedEndDate: mainnetLockedInfo.lockedEndDate
      ? new Date(mainnetLockedInfo.lockedEndDate)
      : undefined,
    mainnetLockedInfo,
  })

  const isValidLockAmount = useMemo(() => bn(amount || '0').gt(0), [])

  const isIncreasedLockAmount = useMemo(
    () => mainnetLockedInfo.hasExistingLock && isValidLockAmount,
    [mainnetLockedInfo, isValidLockAmount]
  )

  const disabledConditions: [boolean, string][] = [
    [!mainnetLockedInfo.hasExistingLock && amount.eq(0), 'You must specify the amount'],
    [hasValidationErrors, 'Errors in token inputs'],
    [
      !mainnetLockedInfo.hasExistingLock && !lockDuration.isValidLockEndDate,
      'Lock end date is invalid',
    ],
    [
      mainnetLockedInfo.hasExistingLock
        ? !lockDuration.isValidLockEndDate && !isIncreasedLockAmount
        : false,
      'To extend you should select the date or change the amount',
    ],
  ]

  const { isDisabled, disabledReason } = isDisabledWithReason(...disabledConditions)

  const previewModalDisclosure = useDisclosure()

  const lockMode = useMemo<LockMode>(() => {
    if (mainnetLockedInfo.isExpired) {
      return LockMode.Unlock
    } else {
      return mainnetLockedInfo.hasExistingLock ? LockMode.Extend : LockMode.Lock
    }
  }, [mainnetLockedInfo.isExpired, mainnetLockedInfo.hasExistingLock])

  const expectedVeBalAmount = expectedVeBal(
    totalAmount.toString(),
    lockDuration.lockEndDate.toString()
  )

  return {
    amount,
    humanAmount,
    setHumanAmount,
    vebalToken,
    isDisabled,
    disabledReason,
    totalAmount,
    lockDuration,
    isLoading,
    previewModalDisclosure,
    lockMode,
    isIncreasedLockAmount,
    expectedVeBalAmount,
    // totalLpTokens,
  }
}

export function VebalLockProvider({ children }: PropsWithChildren & {}) {
  const vebalLock = _useVebalLock()

  return <VebalLockContext.Provider value={vebalLock}>{children}</VebalLockContext.Provider>
}

export const useVebalLock = (): UseVebalLockResult =>
  useMandatoryContext(VebalLockContext, 'VebalLock')
