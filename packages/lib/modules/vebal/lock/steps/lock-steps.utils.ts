import { toUtcTime } from '@repo/lib/shared/utils/time'
import { RawAmount } from '../../../tokens/approvals/approval-rules'
import { LockMode } from '@repo/lib/modules/vebal/lock/VebalLockProvider'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { format } from 'date-fns'
import { PRETTY_DATE_FORMAT } from '@repo/lib/modules/vebal/lock/duration/lock-duration.constants'
import { formatUnits } from 'viem'

export enum LockActionType {
  CreateLock = 'createLock',
  IncreaseLock = 'increaseAmount',
  ExtendLock = 'extendLock',
  Unlock = 'unlock',
}

type LockContractFunctionName =
  | 'create_lock'
  | 'increase_amount'
  | 'increase_unlock_time'
  | 'withdraw'

const contractFunctionNames: Record<LockActionType, LockContractFunctionName> = {
  [LockActionType.CreateLock]: 'create_lock',
  [LockActionType.IncreaseLock]: 'increase_amount',
  [LockActionType.ExtendLock]: 'increase_unlock_time',
  [LockActionType.Unlock]: 'withdraw',
}

export function getLockContractFunctionName(action: LockActionType) {
  return contractFunctionNames[action]
}

export function parseDate(date: string) {
  return (toUtcTime(new Date(date)) / 1000).toString()
}

export function getModalLabel(mode: LockMode, extendExpired: boolean) {
  switch (mode) {
    case LockMode.Lock:
      return 'Lock to get veBAL'
    case LockMode.Extend:
      return 'Extend lock'
    case LockMode.Unlock:
      if (extendExpired) {
        return 'Extend expired lock'
      }
      return 'veBAL expiry'
    default:
      return ''
  }
}

export function getPreviewLabel(mode: LockMode, extendExpired: boolean) {
  switch (mode) {
    case LockMode.Lock:
      return 'Lock'
    case LockMode.Extend:
      return 'Extend lock'
    case LockMode.Unlock:
      if (extendExpired) {
        return 'Extend expired lock'
      }
      return 'Unlock'
    default:
      return ''
  }
}

export function getInitLabel(lockActionType: LockActionType) {
  switch (lockActionType) {
    case LockActionType.CreateLock:
      return 'Create Lock'
    case LockActionType.ExtendLock:
      return 'Extend Lock'
    case LockActionType.IncreaseLock:
      return 'Increase Lock'
    case LockActionType.Unlock:
      return 'Unlock'
    default:
      return ''
  }
}

export function getDescription(lockActionType: LockActionType) {
  switch (lockActionType) {
    case LockActionType.CreateLock:
      return 'Create a new lock for the specified amount and end date.'
    case LockActionType.ExtendLock:
      return 'Extend an existing lock.'
    case LockActionType.IncreaseLock:
      return 'Increase the amount of an existing lock.'
    case LockActionType.Unlock:
      return 'Unlock'
    default:
      return ''
  }
}

export function getConfirmingLabel(lockActionType: LockActionType) {
  switch (lockActionType) {
    case LockActionType.CreateLock:
      return 'Confirming lock creation...'
    case LockActionType.ExtendLock:
      return 'Confirming lock extension...'
    case LockActionType.IncreaseLock:
      return 'Confirming lock increase...'
    case LockActionType.Unlock:
      return 'Confirming unlock...'
    default:
      return ''
  }
}

export function getConfirmedLabel(
  lockActionType: LockActionType,
  lockAmount: RawAmount,
  lockEndDate: string
) {
  const formattedAmount = formatUnits(lockAmount.rawAmount, 18)

  switch (lockActionType) {
    case LockActionType.CreateLock:
      // eslint-disable-next-line max-len
      return `Lock created for ${fNum('token', formattedAmount)} tokens until ${format(new Date(lockEndDate), PRETTY_DATE_FORMAT)}`
    case LockActionType.ExtendLock:
      return `Lock extended until ${format(new Date(lockEndDate), PRETTY_DATE_FORMAT)}`
    case LockActionType.IncreaseLock:
      return `Lock amount increased by ${fNum('token', formattedAmount)}`
    case LockActionType.Unlock:
      return 'Lock unlocked'
    default:
      return ''
  }
}

export function getTooltip(lockActionType: LockActionType) {
  switch (lockActionType) {
    case LockActionType.CreateLock:
      return 'Create a new lock for the specified amount and end date.'
    case LockActionType.ExtendLock:
      return 'Extend the end date of an existing lock.'
    case LockActionType.IncreaseLock:
      return 'Increase the amount of an existing lock.'
    case LockActionType.Unlock:
      return 'Unlock the specified lock.'
    default:
      return ''
  }
}
