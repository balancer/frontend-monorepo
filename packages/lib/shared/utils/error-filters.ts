export function isUserRejectedError(error: Error): boolean {
  return error.message.startsWith('User rejected the request.')
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

export function isUnbalancedAddError(error: Error | null): boolean {
  if (!error) return false
  if (
    isInvariantRatioSimulationErrorMessage(error?.message) ||
    isInvariantRatioPIErrorMessage(error?.message) ||
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
