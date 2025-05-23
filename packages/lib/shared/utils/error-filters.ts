import { hasStableSurgeHook } from '@repo/lib/modules/pool/pool.helpers'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { ErrorWithOptionalShortMessage } from '../components/errors/GenericError'

export function isUserRejectedError(error: Error): boolean {
  return (
    error.message.startsWith('User rejected the request.') ||
    // When the user rejects a transaction in the Safe App and when Safe + WalletConnect:
    error.message.includes('Details: User rejected transaction') ||
    error.message.includes('Details: Transaction was rejected')
  )
}

/*
  Detects "Failed to fetch" Http request errors thrown by wagmi/viem
  These errors could be caused by different reasons, like network issues, CORS, 429 etc.
*/
export function isViemHttpFetchError(error?: Error | null): boolean {
  if (!error) return false
  return (
    error.message.startsWith('HTTP request failed.') && error.message.includes('Failed to fetch')
  )
}

/*
  Detects 429 Too Many Requests errors thrown by wagmi/viem
  We should not have many of them as we are using a private RPC provider but they still could happen when:
  - the provider's rate limiting is not working as expected
  - the provider is down and we are using a public fallback
  - others
*/
export function isTooManyRequestsError(error?: Error | null): boolean {
  if (!error) return false
  return error.message.startsWith('HTTP request failed.') && error.message.includes('Status: 429')
}

export function isNotEnoughGasError(error?: Error | null): boolean {
  if (!error) return false
  return isNotEnoughGasErrorMessage(error.message)
}

export function isNotEnoughGasErrorMessage(errorMessage: string): boolean {
  return errorMessage.startsWith(
    'The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.'
  )
}

export function isPausedError(error?: Error | null): boolean {
  if (!error) return false
  return isPausedErrorMessage(error.message)
}

export function isPausedErrorMessage(errorMessage: string): boolean {
  return errorMessage.includes('reverted with the following reason:\nBAL#402\n')
}

export function isUnbalancedAddError(error: Error | null, pool: Pool): boolean {
  if (!error) return false
  if (isPoolSurgingError(error.message, hasStableSurgeHook(pool))) return true
  if (
    isInvariantRatioSimulationErrorMessage(error.message) ||
    isInvariantRatioPIErrorMessage(error.message) ||
    isUnbalancedAddErrorMessage(error)
  ) {
    return true
  }
  return false
}

export function isUnbalancedAddErrorMessage(error: Error | null): boolean {
  const errorStrings = ['BAL#304', 'queryAddLiquidityUnbalanced'] // [v2 error, v3 error]
  const hasErrors = (errorString: string) => error?.message.includes(errorString)

  return errorStrings.some(hasErrors)
}

export function isInvariantRatioSimulationErrorMessage(errorMessage?: string): boolean {
  return (
    isInvariantRatioAboveMaxSimulationErrorMessage(errorMessage) ||
    isInvariantRatioAboveMinSimulationErrorMessage(errorMessage)
  )
}

export function isInvariantRatioAboveMaxSimulationErrorMessage(errorMessage?: string): boolean {
  return !!errorMessage?.includes('InvariantRatioAboveMax')
}
export function isInvariantRatioAboveMinSimulationErrorMessage(errorMessage?: string): boolean {
  return !!errorMessage?.includes('InvariantRatioBelowMin')
}

export function isInvariantRatioPIErrorMessage(errorMessage?: string): boolean {
  if (!errorMessage) return false
  if (
    errorMessage.includes(
      'addLiquidityUnbalanced operation will fail at SC level with user defined input.'
    ) ||
    errorMessage.includes('Arithmetic operation resulted in underflow or overflow.')
  ) {
    return true
  }
  return false
}

export function isWrapWithTooSmallAmount(errorMessage?: string): boolean {
  if (!errorMessage) return false
  return errorMessage.includes('WrapAmountTooSmall')
}

export function isPoolSurgingError(errorMessage: string, hasStableSurgeHook: boolean): boolean {
  return (
    hasStableSurgeHook &&
    (isAfterAddUnbalancedHookError(errorMessage) || isSingleRemoveHookError(errorMessage))
  )
}

function isAfterAddUnbalancedHookError(errorMessage: string): boolean {
  if (!errorMessage) return false
  return errorMessage.includes('AfterAddLiquidityHookFailed()')
}

function isSingleRemoveHookError(errorMessage: string): boolean {
  if (!errorMessage) return false
  return errorMessage.includes('AfterRemoveLiquidityHookFailed()')
}

export function isLedgerUnknownError(error?: ErrorWithOptionalShortMessage | null): boolean {
  /* Some users reported errors when using Ledger

  Example in veBal BPT approvals: https://discord.com/channels/638460494168064021/1356279093045498029/1356279506733895811

  The root cause can be:
  - Ledger not being updated
  - Ledger + Metamask or other wallets not working properly in edge case scenarios like v2 BPT approvals
    (using increaseApproval instead of approve could be a workaround for that specific case)
  - Users reported that using Frame wallet also workarounds those issues
  */
  if (!error) return false
  const hasErrorInMessage = error.message?.includes('Ledger: Unknown error') ?? false
  const hasErrorInShortMessage = error.shortMessage?.includes('Ledger: Unknown error') ?? false

  return hasErrorInMessage || hasErrorInShortMessage
}
