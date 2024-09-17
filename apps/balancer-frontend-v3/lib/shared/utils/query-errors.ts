import { captureException } from '@sentry/nextjs'
import {
  Extras,
  ScopeContext,
  Stacktrace as SentryStack,
  Exception as SentryException,
} from '@sentry/types'
import { SentryError, ensureError } from './errors'
import { isUserRejectedError } from './error-filters'
import {
  AddLiquidityParams,
  stringifyHumanAmountsIn,
} from '@/lib/modules/pool/actions/add-liquidity/queries/add-liquidity-keys'
import { RemoveLiquidityParams } from '@/lib/modules/pool/actions/remove-liquidity/queries/remove-liquidity-keys'
import { SimulateSwapParams } from '@/lib/modules/swap/queries/useSimulateSwapQuery'
import { isProd } from '@/lib/config/app.config'
import { SwapState } from '@/lib/modules/swap/swap.types'
import { SwapHandler } from '@/lib/modules/swap/handlers/Swap.handler'

/**
 * Metadata to be added to the captured Sentry error
 * We use this type in react-query v5 "meta" property (exposed by wagmi v2)
 * More info: https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose#defining-on-demand-messages
 */
export type SentryMetadata = {
  errorMessage: string
  errorName?: string
  context?: Partial<ScopeContext>
}

type AddMetaParams = AddLiquidityParams & { chainId: number; blockNumber?: bigint }
export function sentryMetaForAddLiquidityHandler(errorMessage: string, params: AddMetaParams) {
  return createAddHandlerMetadata('HandlerQueryError', errorMessage, params)
}

type RemoveMetaParams = RemoveLiquidityParams & { chainId: number; blockNumber?: bigint }
export function sentryMetaForRemoveLiquidityHandler(
  errorMessage: string,
  params: RemoveMetaParams
) {
  return createRemoveHandlerMetadata('HandlerQueryError', errorMessage, params)
}

export type SwapBuildCallExtras = {
  handler: SwapHandler
  swapState: SwapState
  slippage: string
  wethIsEth: boolean
}

export type SwapMetaParams = (SimulateSwapParams | SwapBuildCallExtras) & {
  chainId: number
  blockNumber?: bigint
}
export function sentryMetaForSwapHandler(errorMessage: string, params: SwapMetaParams) {
  return createSwapHandlerMetadata('HandlerQueryError', errorMessage, params)
}

/**
 * Used by all wagmi managed queries to create sentry metadata for simulation errors
 */
export function sentryMetaForWagmiSimulation(errorMessage: string, extra: Extras) {
  return createFatalErrorMetadata('WagmiSimulationError', errorMessage, extra)
}

/**
 * Used by all wagmi managed queries to create sentry metadata for execution errors
 */
export function sentryMetaForWagmiExecution(errorMessage: string, extra: Extras) {
  return createFatalErrorMetadata('WagmiExecutionError', errorMessage, extra)
}

export function captureWagmiExecutionError(error: unknown, errorMessage: string, extra: Extras) {
  captureSentryError(error, sentryMetaForWagmiExecution(errorMessage, extra))
}

/**
 * Only used in edge-cases when we want to capture a fatal error outside the context of a react-query
 */
export function captureFatalError(
  error: unknown,
  errorName: string,
  errorMessage: string,
  extra: Extras
) {
  captureSentryError(error, createFatalMetadata(errorName, errorMessage, extra))
}

/**
 * Only used in edge-cases when we want to capture a non-fatal error outside the context of a react-query
 */
type NonFatalErrorParams = {
  error: unknown
  errorName: string
  errorMessage?: string
  extra?: Extras
}
export function captureNonFatalError({
  error,
  errorName,
  extra = {},
  errorMessage = '',
}: NonFatalErrorParams) {
  captureSentryError(error, createNonFatalMetadata(errorName, errorMessage, extra))
}

/**
 * Used by all queries to capture fatal sentry errors with metadata
 */
export function createFatalErrorMetadata(errorName: string, errorMessage: string, extra: Extras) {
  return createFatalMetadata(errorName, errorMessage, extra)
}

/**
 * Creates sentry metadata for errors in add liquidity handlers
 */
function createAddHandlerMetadata(
  errorName: string,
  errorMessage: string,
  params: AddLiquidityParams
) {
  const extra: Extras = {
    handler: params.handler.constructor.name,
    params: {
      ...params,
      humanAmountsIn: stringifyHumanAmountsIn(params.poolType, params.humanAmountsIn),
    },
  }
  return createFatalMetadata(errorName, errorMessage, extra)
}

/**
 * Creates sentry metadata for errors in remove liquidity handlers
 */
function createRemoveHandlerMetadata(
  errorName: string,
  errorMessage: string,
  params: RemoveMetaParams
) {
  const extra: Extras = {
    handler: params.handler.constructor.name,
    params,
  }
  return createFatalMetadata(errorName, errorMessage, extra)
}

/**
 * Creates sentry metadata for errors in swap handlers
 */
function createSwapHandlerMetadata(
  errorName: string,
  errorMessage: string,
  params: SwapMetaParams
) {
  const { handler, ...rest } = params
  const extra: Extras = {
    handler: handler.constructor.name,
    params: rest,
  }
  return createFatalMetadata(errorName, errorMessage, extra)
}

function createFatalMetadata(
  errorName: string,
  errorMessage: string,
  extra: Extras
): SentryMetadata {
  const context: Partial<ScopeContext> = {
    extra,
    level: 'fatal',
  }
  return {
    errorMessage,
    errorName,
    context,
  }
}

function createNonFatalMetadata(
  errorName: string,
  errorMessage = '',
  extra: Extras = {}
): SentryMetadata {
  const context: Partial<ScopeContext> = {
    extra,
    level: 'error',
  }
  return {
    errorMessage,
    errorName,
    context,
  }
}

export function createErrorMetadata(
  errorName: string,
  errorMessage: string,
  extra: Extras
): SentryMetadata {
  const context: Partial<ScopeContext> = {
    extra,
    level: 'error',
  }
  return {
    errorMessage,
    errorName,
    context,
  }
}

/**
 * Creates a SentryError with metadata and sends it to sentry
 * Used by all queries from QueryCache onError in global queryClient
 * More info: https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose#a-bad-api
 */
export function captureSentryError(
  e: unknown,
  { context, errorMessage, errorName }: SentryMetadata
) {
  console.log('Context en captureSentryError', context)
  const causeError = ensureError(e)
  if (isUserRejectedError(causeError)) return

  // Adding the root cause message to the top level message makes slack alerts more useful
  const errorMessageWithCause = errorMessage + `\n\nCause: \n` + causeError.message

  const sentryError = new SentryError(errorMessageWithCause, {
    cause: causeError,
    name: errorName,
    context,
  })

  captureException(sentryError, context)
}

/*
  Detects common errors that we don't want to capture in Sentry
*/
export function shouldIgnoreException(sentryException: SentryException) {
  const errorMessage = sentryException.value || ''
  const ignored = shouldIgnore(errorMessage, sentryStackFramesToString(sentryException.stacktrace))
  if (ignored && !isProd) console.log('Ignoring error with message: ', errorMessage)
  return ignored
}

export function shouldIgnore(message: string, stackTrace = ''): boolean {
  if (isUserRejectedError(new Error(message))) return true

  /*
    Thrown from useWalletClient() when loading a pool page from scratch.
    It looks like is is caused by the useWalletClient call in AddTokenToWalletButton but it does not affect it's behavior.
  */
  if (message.includes('.getAccounts is not a function')) return true

  /*
    Error thrown by Library detector chrome extension:
    https://chromewebstore.google.com/detail/library-detector/cgaocdmhkmfnkdkbnckgmpopcbpaaejo?hl=en
  */
  if (message.includes(`Cannot set properties of null (setting 'content')`)) return true

  /*
    Frequent errors in rainbowkit + wagmi that do not mean a real crash
  */
  if (message.includes('Connector not connected')) return true
  if (message.includes('Provider not found')) return true

  /*
    More info: https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
  */
  if (message.includes('ResizeObserver loop limit exceeded')) return true

  /*
    Wallet Connect bug when switching certain networks.
    It does not crash the app.
    More info: https://github.com/MetaMask/metamask-mobile/issues/9157
  */
  if (message.includes('Missing or invalid. emit() chainId')) return true

  /*
    Some extensions cause this error
    Examples: https://balancer-labs.sentry.io/issues/5623611453/
  */
  if (
    message.startsWith('Maximum call stack size exceeded') &&
    stackTrace.includes('injectWalletGuard.js')
  ) {
    return true
  }

  /*
    com.okex.wallet injects code that causes this error
    Examples: https://balancer-labs.sentry.io/issues/5687846148/
  */
  if (message.startsWith('Cannot redefine property:') && stackTrace.includes('inject.bundle.js')) {
    return true
  }

  /*
    Wagmi error which does not crash.
    Can be reproduced by:
      1. Connect with Rabby
      2. Disconnect Rabby from the app
      3. Click "Connect wallet" and chose WalletConnect
  */
  if (
    message === "Cannot read properties of undefined (reading 'address')" &&
    stackTrace.includes('getWalletClient.js')
  ) {
    return true
  }

  /*
    Waller Connect bug
    More info: https://github.com/WalletConnect/walletconnect-monorepo/issues/4318
  */
  if (message.startsWith('WebSocket connection failed for host: wss://relay.walletconnect.com')) {
    return true
  }

  /*
    Ignores issues with this kind of message:

    The source https://balancer.fi/[URI] has not been authorized yet

    We cannot reproduce but it looks like it does not crash the app.

    First time seen in sentry: September 4th, 2024
    https://vercel.com/balancer/frontend-v3/deployments?range={%22start%22:%222024-09-02T22:00:00.000Z%22,%22end%22:%222024-09-03T21:59:59.999Z%22}

    Examples: https://balancer-labs.sentry.io/issues/5796181794
  */
  if (message.startsWith('The source') && message.includes('has not been authorized yet')) {
    return true
  }

  return false
}

function sentryStackFramesToString(sentryStack?: SentryStack): string {
  if (!sentryStack?.frames?.length) return ''
  return (
    sentryStack.frames
      // We only check the last 4 frames (root of the error)
      .slice(-4)
      .map(frame => frame.filename || '')
      .join()
  )
}

export function getTenderlyUrl(sentryExtras?: Extras) {
  if (!sentryExtras) return
  return sentryExtras.tenderlyUrl as string | undefined
}
