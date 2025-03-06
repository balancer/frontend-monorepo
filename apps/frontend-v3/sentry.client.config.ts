// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { sentryDSN } from './sentry.config'
import { isProd } from '@repo/lib/config/app.config'
import {
  customizeEvent,
  getErrorTextFromTop3Frames,
  shouldIgnoreException,
} from '@repo/lib/shared/utils/sentry.helpers'

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
  if (shouldIgnoreException(event)) return null
  event.level = 'error'

  return customizeEvent(event)
}

function handleFatalError(
  event: Sentry.ErrorEvent,
  criticalFlowPath: string
): Sentry.ErrorEvent | null {
  event.level = 'fatal'

  if (event?.exception?.values?.length) {
    const lastIndex = event.exception.values.length - 1
    const topValue = event.exception.values[lastIndex]

    if (shouldIgnoreException(event)) return null

    const flowType = uppercaseSegment(criticalFlowPath)
    topValue.value = `Unexpected error in ${flowType} flow.
    Cause: ${topValue.type}: ${topValue.value}`

    topValue.type = flowType + 'Error'
    event.exception.values[lastIndex] = topValue
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
  const errorText = getErrorTextFromTop3Frames(event)
  if (errorText.includes('Invalid swap: must contain at least 1 path.')) return true

  return false
}
