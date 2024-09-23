export function isUserRejectedError(error: Error): boolean {
  return error.message.startsWith('User rejected the request.')
}

/*
  Detects "Failed to fetch" Http request errors thrown by wagmi/viem
  These errors could be caused by different reasons, like network issues, CORS, 429 etc.
*/
export function isViemHttpFetchError(error?: Error | null): boolean {
  if (!error) return false
  if (
    error.message.startsWith('HTTP request failed.') &&
    error.message.includes('Failed to fetch')
  ) {
    return true
  }
  return false
}
