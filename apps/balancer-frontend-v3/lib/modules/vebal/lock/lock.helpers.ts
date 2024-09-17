import { toUtcTime } from '@/lib/shared/utils/time'
import { RawAmount } from '../../tokens/approvals/approval-rules'

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
  switch (lockActionType) {
    case LockActionType.CreateLock:
      return `Lock created for ${lockAmount.rawAmount} tokens until ${lockEndDate}`
    case LockActionType.ExtendLock:
      return `Lock extended until ${lockEndDate}`
    case LockActionType.IncreaseLock:
      return `Lock amount increased by ${lockAmount.rawAmount}`
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
