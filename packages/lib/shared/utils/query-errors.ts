import { captureException } from '@sentry/nextjs'
/*
  Types are deprecated but we are waiting for a guide for @sentry/nextjs
  Context: https://github.com/getsentry/sentry-javascript/discussions/15042
*/
import { Extras, ScopeContext } from '@sentry/core'
import { SentryError, ensureError } from './errors'
import {
  isInvariantRatioPIErrorMessage,
  isInvariantRatioSimulationErrorMessage,
  isNotEnoughGasErrorMessage,
  isPausedErrorMessage,
  isUserRejectedError,
} from './error-filters'
import {
  AddLiquidityParams,
  stringifyHumanAmountsIn,
} from '@repo/lib/modules/pool/actions/add-liquidity/queries/add-liquidity-keys'
import { RemoveLiquidityParams } from '@repo/lib/modules/pool/actions/remove-liquidity/queries/remove-liquidity-keys'
import { SimulateSwapParams } from '@repo/lib/modules/swap/queries/useSimulateSwapQuery'
import { SwapState } from '@repo/lib/modules/swap/swap.types'
import { SwapHandler } from '@repo/lib/modules/swap/handlers/Swap.handler'
import { cannotCalculatePriceImpactError } from '@repo/lib/modules/price-impact/price-impact.utils'

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

type AddMetaParams = AddLiquidityParams & {
  chainId: number
  blockNumber?: bigint
  hasStableSurgeHook?: boolean
}
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
  const { pool, ...restParams } = params
  const extra: Extras = {
    handler: params.handler.constructor.name,
    params: {
      ...restParams,
      poolId: pool.id,
      poolType: pool.type,
      humanAmountsIn: stringifyHumanAmountsIn(pool, params.humanAmountsIn),
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

export function shouldIgnore(message: string, stackTrace = ''): boolean {
  if (isUserRejectedError(new Error(message))) return true

  if (isNotEnoughGasErrorMessage(message)) return true

  /*
    There are some edge cases where price impact calculation is not possible so we display "Unknown price impact".
    We don't want to capture those errors in sentry as they are not actual issues.
   */
  if (cannotCalculatePriceImpactError(new Error(message))) return true

  /*
   This is a known rainbow-kit/wagmi related issue that is randomly happening to many users.
   It does not crash the app so we are ignoring it.
   More context: https://github.com/rainbow-me/rainbowkit/issues/2238
  */
  if (message.includes('provider.disconnect is not a function')) return true
  if (stackTrace.includes('provider.disconnect is not a function')) return true

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

  if (
    message.startsWith('Maximum call stack size exceeded') &&
    stackTrace.includes('HTMLMediaElement.canPlayType')
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
    Extension related error which does not crash.
    Examples: https://balancer-labs.sentry.io/issues/5622743248/
  */
  if (
    message ===
      "Cannot destructure property 'address' of '(intermediate value)' as it is undefined." &&
    stackTrace.includes('extensionPageScript.js')
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
  if (message.startsWith('WebSocket connection closed abnormally with code: 3000')) {
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
  if (
    message.includes('The source https://balancer.fi') &&
    message.includes('has not been authorized yet')
  ) {
    return true
  }

  if (isPausedErrorMessage(message)) return true

  /*
    When hitting Invariant Ratio Above max error (only in v3 pools) we enforce proportional UX so we don't need sentry logs
    Context: https://github.com/balancer/balancer-maths/blob/8aaf871acd9e138ba855f03be723cdfd630f4246/typescript/src/weighted/weightedMath.ts#L10
    */
  if (isInvariantRatioSimulationErrorMessage(message) || isInvariantRatioPIErrorMessage(message)) {
    return true
  }

  /*
    Error thrown from Metamask when:
    1. The extension popup is ignored by the user
    2. They close the RainbowKit "Connect a wallet" modal
    3. They click "Connect wallet" and chose "Metamask" a second time

    As the extension modal was still opened in the background, MM will throw this error, that can be safely ignored as the Rainbowkit modal clearly states:
    "Confirm connection in the extension"
   */
  if (message.includes(`Request of type 'wallet_requestPermissions' already pending for origin`)) {
    return true
  }

  return false
}

export function getTenderlyUrl(sentryMetadata?: SentryMetadata) {
  if (!sentryMetadata) return
  return sentryMetadata?.context?.extra?.tenderlyUrl as string | undefined
}
