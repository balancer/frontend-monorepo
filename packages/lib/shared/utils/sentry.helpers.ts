import { ErrorEvent } from '@sentry/nextjs'
import { shouldIgnore } from './query-errors'
import { isProd } from '@repo/lib/config/app.config'

/*
  The stack trace goes in reverse order, so we take the last 3 frames to get the most relevant information.
*/
export function getErrorTextFromTop3Frames(event: ErrorEvent): string {
  if (event?.exception?.values?.length) {
    const last3Exceptions = event.exception.values.slice(-3)
    return last3Exceptions.map(exception => `${exception.type}: ${exception.value}`).join(' | ')
  }
  return ''
}

/*
  Detects common errors that we don't want to capture in Sentry
*/
export function shouldIgnoreException(event: ErrorEvent) {
  const errorMessage = getErrorTextFromTop3Frames(event)
  const ignored = shouldIgnore(errorMessage)
  if (ignored && !isProd) console.log('Ignoring error with message: ', errorMessage)
  return ignored
}

export function customizeEvent(event: ErrorEvent) {
  return addFingerPrint(addTags(event))
}

/*
  Add custom fingerprints to group errors that have the same root cause that we couldn't fix yet.
*/
export function addFingerPrint(event: ErrorEvent) {
  const errorMessage = getErrorTextFromTop3Frames(event)

  /*
    Some users have this error related with WalletConnect
  */
  if (errorMessage.includes(`Failed to execute 'transaction' on 'IDBDatabase'`)) {
    event.fingerprint = ['IDBDatabaseError']
  }
  if (errorMessage.includes(`'IDBDatabase': The database connection is closing.`)) {
    event.fingerprint = ['IDBDatabaseClosing']
  }

  /*
    Wagmi wallet related error
  */
  if (
    errorMessage.includes(
      `Cause: TypeError: Cannot read properties of undefined (reading 'address')`
    )
  ) {
    event.fingerprint = ['UndefinedReadingAddress']
  }

  /*
    Disconnection error that usually happens with MetaMask.
    Context: https://github.com/balancer/frontend-monorepo/issues/61
  */
  if (errorMessage.includes(`Cannot read properties of undefined (reading 'listenerCount')`)) {
    event.fingerprint = ['UndefinedListenerCount']
  }

  /*
    Connectivity error in Apollo query from default swaps
    Context: https://github.com/balancer/frontend-monorepo/pull/480
  */
  if (errorMessage.includes('Apollo network error in DefaultSwapHandler')) {
    event.fingerprint = ['SwapApolloNetworkError']
  }

  /*
    Wallet connect + Metamask error
    Context: https://github.com/MetaMask/metamask-mobile/issues/11288
  */
  if (errorMessage.includes('Missing or invalid. Record was recently deleted')) {
    event.fingerprint = ['WCRecordDeleted']
  }

  /*
    Withdrawal error in Element protocol
    Context: https://blog.delv.tech/withdrawing-funds-from-the-element-protocol-a-step-by-step-guide-using-etherscan/
  */
  if (errorMessage.includes('Unsupported pool type ELEMENT')) {
    event.fingerprint = ['UnsupportedPoolTypeElement']
  }

  /*
    When the Wagmi Config is out-of-sync with the connector's active chain ID. This is rare and likely an upstream wallet issue.
    Context: https://wagmi.sh/react/api/errors#connectorchainmismatcherror
  */
  if (errorMessage.includes('ConnectorChainMismatchError')) {
    event.fingerprint = ['ConnectorChainMismatchError']
  }
  /*
    Context: https://wagmi.sh/core/api/errors#connectoralreadyconnectederror
  */
  if (errorMessage.includes('ConnectorAlreadyConnectedError')) {
    event.fingerprint = ['ConnectorAlreadyConnectedError']
  }

  /*
    Context: https://wagmi.sh/react/api/errors#connectorchainmismatcherror
  */
  if (errorMessage.includes('TransactionNotFoundError: Transaction with hash')) {
    event.fingerprint = ['TransactionNotFoundError']
  }

  if (errorMessage.includes('transfer amount exceeds balance')) {
    event.fingerprint = ['TransferAmountExceedsBalance']
  }

  // Context: https://github.com/wevm/viem/discussions/472
  if (
    errorMessage.includes(
      'The requested method and/or account has not been authorized by the user.'
    )
  ) {
    event.fingerprint = ['RequestedMethodNotAuthorized']
  }

  if (
    errorMessage.includes(
      'The fee cap (`maxFeePerGas` gwei) cannot be lower than the block base fee'
    )
  ) {
    event.fingerprint = ['MaxFeePerGasLowerThanBaseFee']
  }

  /*
    Error sending transaction errors with different causes
  */
  if (
    errorMessage.includes('Error sending transaction') &&
    errorMessage.includes('An internal error was received.')
  ) {
    event.fingerprint = ['ErrorSendingTransaction-InternalError']
  }
  if (
    errorMessage.includes('Error sending transaction') &&
    errorMessage.includes('An unknown RPC error occurred')
  ) {
    event.fingerprint = ['ErrorSendingTransaction-RPCError']
  }
  if (
    errorMessage.includes('Error sending transaction') &&
    errorMessage.includes('Requested resource not available')
  ) {
    event.fingerprint = ['ErrorSendingTransaction-ResourceNotAvailable']
  }
  if (errorMessage.includes('Error sending transaction') && errorMessage.includes('URL:')) {
    event.fingerprint = ['ErrorSendingTransaction-URL']
  }
  if (
    errorMessage.includes('Error sending transaction') &&
    errorMessage.includes(`does not match the connection's chain`)
  ) {
    event.fingerprint = ['ErrorSendingTransaction-ChainMismatch']
  }

  /*
    Errors in swap gas estimation with different causes
  */
  if (
    errorMessage.startsWith('Error in swap gas estimation') &&
    errorMessage.includes('Execution reverted for an unknown reason')
  ) {
    event.fingerprint = ['SwapGasEstimationError-UnknownReason']
  }
  if (
    errorMessage.startsWith('Error in swap gas estimation') &&
    errorMessage.includes('transfer amount exceeds balance')
  ) {
    event.fingerprint = ['SwapGasEstimationError-TransferAmountExceedsBalance']
  }
  if (errorMessage.startsWith('Error in swap gas estimation') && errorMessage.includes('BAL#50')) {
    event.fingerprint = ['SwapGasEstimationError-BAL50x']
  }
  if (errorMessage.startsWith('Error in swap gas estimation') && errorMessage.includes('GYR#357')) {
    event.fingerprint = ['SwapGasEstimationError-GYR357']
  }

  /*
    Errors in Add liquidity gas estimation with different causes
  */
  if (
    errorMessage.startsWith('Error in AddLiquidity gas estimation') &&
    errorMessage.includes('Execution reverted for an unknown reason')
  ) {
    event.fingerprint = ['AddGasEstimationError-UnknownReason']
  }
  if (
    errorMessage.startsWith('Error in AddLiquidity gas estimation') &&
    errorMessage.includes('transfer amount exceeds balance')
  ) {
    event.fingerprint = ['AddGasEstimationError-TransferAmountExceedsBalance']
  }
  if (
    errorMessage.startsWith('Error in AddLiquidity gas estimation') &&
    errorMessage.includes('RPC Request failed')
  ) {
    event.fingerprint = ['AddGasEstimationError-RPCRequestFailed']
  }
  if (
    errorMessage.startsWith('Error in AddLiquidity gas estimation') &&
    errorMessage.includes('TRANSFER_FROM_FAILED')
  ) {
    event.fingerprint = ['AddGasEstimationError-TransferFromFailed']
  }

  // Could have different causes but we group them together for now
  if (errorMessage.includes('Error in managed transaction')) {
    event.fingerprint = ['ManagedTransactionError']
  }

  if (errorMessage.includes('this.provider.disconnect is not a function')) {
    event.fingerprint = ['ProviderDisconnectError']
  }

  if (errorMessage.includes('Requested resource not available')) {
    event.fingerprint = ['RequestedResourceNotAvailable']
  }

  if (errorMessage.includes('No matching key. session topic')) {
    event.fingerprint = ['NoMatchingKeySessionTopic']
  }

  // Walletconnect error
  if (errorMessage.includes('WebSocket connection failed for host')) {
    event.fingerprint = ['WCWebSocketConnectionFailed']
  }

  // Potential Next deployment errors
  if (errorMessage.includes('ChunkLoadError: Loading chunk')) {
    event.fingerprint = ['ChunkLoadError']
  }

  if (errorMessage.includes('buildCallData query Cause: Address "" is invalid')) {
    event.fingerprint = ['BuildCallDataAddressInvalid']
  }

  if (errorMessage.includes('SwitchChainError')) {
    event.fingerprint = ['SwitchChainError']
  }

  if (errorMessage.includes('TypeError: f is undefined')) {
    event.fingerprint = ['FIsUndefined']
  }

  if (errorMessage.includes('Invalid parameters were provided to the RPC method')) {
    event.fingerprint = ['InvalidParametersRPC']
  }

  if (
    errorMessage.includes(
      `Cannot destructure property 'register' of 'undefined' as it is undefined.`
    )
  ) {
    event.fingerprint = ['DestructureRegisterUndefined']
  }

  /*
    Could not reproduce yet.
    BAL#001 SUB_OVERFLOW
  */
  if (errorMessage.includes('BAL#001')) {
    event.fingerprint = ['BAL001']
  }

  /*
      Could not reproduce yet.
      BAL#401 SENDER_NOT_ALLOWED
    */
  if (errorMessage.includes('BAL#401')) {
    event.fingerprint = ['BAL401']
  }

  /*
      Could not reproduce yet.
      BAL#509 CANNOT_SWAP_SAME_TOKEN
    */
  if (errorMessage.includes('BAL#509')) {
    event.fingerprint = ['BAL509']
  }

  if (errorMessage.includes('removeChild')) {
    event.fingerprint = ['RemoveChildError']
  }

  if (errorMessage.includes('RPC Request failed.')) {
    event.fingerprint = ['RPCRequestFailed.']
  }

  if (errorMessage.includes('Maximum call stack size exceeded')) {
    event.fingerprint = ['MaximumCallStackSizeExceeded']
  }

  if (errorMessage.includes(`Cannot read properties of undefined (reading 'map')`)) {
    event.fingerprint = ['UndefinedReadingMap']
  }

  if (errorMessage.includes(`Cannot read properties of null (reading 'type')`)) {
    event.fingerprint = ['NullReadingType']
  }

  if (errorMessage.includes('Error: not found method')) {
    event.fingerprint = ['NotFoundMethod']
  }

  if (errorMessage.includes('Error in swap simulation query Cause: Load failed')) {
    event.fingerprint = ['SwapSimulationLoadFailed']
  }

  if (errorMessage.includes('UnhandledRejection: Object captured as promise rejection with keys')) {
    event.fingerprint = ['UnhandledRejection']
  }

  /*
    This is one of the most common errors so we should split in more fingerprints as we find different sets.
  */
  if (errorMessage.includes('Execution reverted for an unknown reason')) {
    event.fingerprint = ['ExecutionRevertedUnknownReason']
  }

  return event
}

// Add tags to better filter errors in sentry dashboards
export function addTags(event: ErrorEvent) {
  const errorText = getErrorTextFromTop3Frames(event)

  /*
   This is a known rainbow-kit/wagmi related issue that is randomly happening to many users.
   We couldn't understand/reproduce it yet so we are tagging it as a known issue to track it better.
   More context: https://github.com/rainbow-me/rainbowkit/issues/2238
  */
  if (errorText.includes('provider.disconnect is not a function')) {
    event.tags = { ...event.tags, error_category: 'known_issue', error_type: 'provider_disconnect' }
  }

  return event
}
