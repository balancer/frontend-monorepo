// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { sentryDSN } from './sentry.config'
import { isProd } from '@repo/lib/config/app.config'
import { shouldIgnoreException } from '@repo/lib/shared/utils/query-errors'

Sentry.init({
  // Change this value only if you need to debug in development (we have a custom developmentSentryDSN for that)
  enabled: isProd,
  dsn: sentryDSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 0,

  replaysSessionSampleRate: 0,

  // disable all default integrations to debug
  // defaultIntegrations: false

  integrations: function (integrations) {
    // Filter out the default GlobalHandlers integration that we will customize later
    const filteredIntegrations = integrations.filter(() => true)

    /*
    Example of custom integration (updating GlobalHandlers integration)

    import { globalHandlersIntegration } from '@sentry/nextjs'

    filteredIntegrations.push(
       globalHandlersIntegration({
         onerror: false,
         onunhandledrejection: false,
       })
     )
     console.log(
       'Active sentry integrations: ',
       filteredIntegrations.map(i => i.name)
     )
     */
    return filteredIntegrations
  },

  beforeSend(event) {
    /*
      The transaction values in the nextjs-sentry integration are misleading
      so we replace them with the url of the request that caused the error
    */
    if (event.transaction) {
      event.transaction = event.request?.url || ''
    }
    /*
      Ensure that we capture all possible errors, including the ones that NextJS/React Error boundaries can't properly catch.
      If the error comes from a flow url, we tag it as fatal and add custom exception type for better traceability/grouping.
      More info:
        Error boundaries:
          https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
          https://nextjs.org/docs/app/building-your-application/routing/error-handling
        Sentry integrations:
          https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/integrations/
    */
    const criticalFlowPaths = [
      'add-liquidity',
      'remove-liquidity',
      'stake',
      'unstake',
      'migrate-stake',
      'swap',
    ]
    const criticalFlowPath = criticalFlowPaths.find(path => event.request?.url?.includes(path))
    if (!criticalFlowPath || isNonFatalError(event)) {
      return handleNonFatalError(event)
    }
    return handleFatalError(event, criticalFlowPath)
  },
})

function handleNonFatalError(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
  const firstValue = getFirstExceptionValue(event)
  if (firstValue && shouldIgnoreException(firstValue)) return null
  event.level = 'error'

  return customizeEvent(event)
}

function handleFatalError(
  event: Sentry.ErrorEvent,
  criticalFlowPath: string
): Sentry.ErrorEvent | null {
  event.level = 'fatal'

  if (event?.exception?.values?.length) {
    const firstValue = event.exception.values[0]

    if (shouldIgnoreException(firstValue)) return null

    const flowType = uppercaseSegment(criticalFlowPath)
    firstValue.value = `Unexpected error in ${flowType} flow.
    Cause: ${firstValue.type}: ${firstValue.value}`

    firstValue.type = flowType + 'Error'
    event.exception.values[0] = firstValue
  }

  return customizeEvent(event)
}

function uppercaseSegment(path: string): string {
  return path
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

// Detect errors that are not considered fatal even if they happen in a critical path
function isNonFatalError(event: Sentry.ErrorEvent) {
  const firstValue = getFirstExceptionValue(event)
  if (firstValue?.value === 'Invalid swap: must contain at least 1 path.') return true

  return false
}

function getFirstExceptionValue(event: Sentry.ErrorEvent) {
  if (event?.exception?.values?.length) {
    return event.exception.values[0]
  }
}

function customizeEvent(event: Sentry.ErrorEvent) {
  return addFingerPrint(addTags(event))
}

// Add tags to better filter errors in sentry dashboards
function addTags(event: Sentry.ErrorEvent) {
  const errorMessage = getFirstExceptionValue(event)?.value || ''

  /*
   This is a known rainbow-kit/wagmi related issue that is randomly happening to many users.
   We couldn't understand/reproduce it yet so we are tagging it as a known issue to track it better.
   More context: https://github.com/rainbow-me/rainbowkit/issues/2238
  */
  if (errorMessage.includes('provider.disconnect is not a function')) {
    event.tags = { ...event.tags, error_category: 'known_issue', error_type: 'provider_disconnect' }
  }

  return event
}

/*
  Add custom fingerprints to group errors that have the same root cause that we couldn't fix yet.
*/
function addFingerPrint(event: Sentry.ErrorEvent) {
  const errorMessage = getFirstExceptionValue(event)?.value || ''

  /*
    Some users have this error related with WalletConnect
  */
  if (errorMessage.includes(`Failed to execute 'transaction' on 'IDBDatabase'`)) {
    event.fingerprint = ['IDBDatabaseError']
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

  /*
    Could not reproduce yet.
    BAL#401 SENDER_NOT_ALLOWED
  */
  if (errorMessage.includes('Execution reverted with reason: BAL#401.')) {
    event.fingerprint = ['BAL401']
  }

  /*
    Could not reproduce yet.
    BAL#509 CANNOT_SWAP_SAME_TOKEN
  */
  if (errorMessage.includes('Execution reverted with reason: BAL#509.')) {
    event.fingerprint = ['BAL509']
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

  return event
}
