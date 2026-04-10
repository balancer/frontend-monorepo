import { toUtcTime } from '@repo/lib/shared/utils/time'
import { LockMode } from '@bal/lib/vebal/lock/VebalLockProvider'
import { LockActionType } from '@repo/lib/modules/vebal/vote/vote.types'

type LockContractFunctionName = 'withdraw'

const contractFunctionNames: Record<LockActionType, LockContractFunctionName> = {
  [LockActionType.Unlock]: 'withdraw',
}

export function getLockContractFunctionName(action: LockActionType) {
  return contractFunctionNames[action]
}

export function parseDate(date: string) {
  return (toUtcTime(new Date(date)) / 1000).toString()
}

export function getModalLabel(mode: LockMode) {
  switch (mode) {
    case LockMode.Unlock:
      return 'veBAL expiry'
    default:
      return ''
  }
}

export function getPreviewLabel(mode: LockMode) {
  switch (mode) {
    case LockMode.Unlock:
      return 'Unlock'
    default:
      return ''
  }
}

export function getInitLabel(lockActionType: LockActionType) {
  switch (lockActionType) {
    case LockActionType.Unlock:
      return 'Unlock'
    default:
      return ''
  }
}

export function getDescription(lockActionType: LockActionType) {
  switch (lockActionType) {
    case LockActionType.Unlock:
      return 'Unlock'
    default:
      return ''
  }
}

export function getConfirmingLabel(lockActionType: LockActionType) {
  switch (lockActionType) {
    case LockActionType.Unlock:
      return 'Confirming unlock...'
    default:
      return ''
  }
}

export function getConfirmedLabel(lockActionType: LockActionType) {
  switch (lockActionType) {
    case LockActionType.Unlock:
      return 'Lock unlocked'
    default:
      return ''
  }
}

export function getTooltip(lockActionType: LockActionType) {
  switch (lockActionType) {
    case LockActionType.Unlock:
      return 'Unlock the specified lock.'
    default:
      return ''
  }
}
