/**
 * For Patterns see: https://medium.com/with-orus/the-5-commandments-of-clean-error-handling-in-typescript-93a9cbdf1af5
 *
 * try/catch should looks something like this:
 *
 *    try {
 *      runFragileCode(params)
 *    } catch (err) {
 *      const error = ensureError(err)
 *
 *      throw new SentryError('A constant error message, no interpolation', {
 *        cause: error // maintain stack trace
 *        context: { extra: params } // add additional context
 *      })
 *    }
 */
import { TransactionConfig } from '@/lib/modules/web3/contracts/contract.types'
import { buildTenderlyUrl } from '@/lib/modules/web3/useTenderly'
import { captureException } from '@sentry/nextjs'
import { ScopeContext } from '@sentry/types/types/scope'

// Wraps Sentry's captureException to allow for additional context or to use
// where we don't want to throw an error.
export function captureError(error: Error, context?: Partial<ScopeContext>): void {
  captureException(error, { ...context })
}

// Wraps Sentry's captureException to capture an error without throwing.
export function captureErrorMessage(errorMessage: string, context?: Partial<ScopeContext>): void {
  captureException(new Error(errorMessage), { ...context })
}

// Extends base Error class to allow for additional context and to automatically
// capture the error in Sentry. Enforces that all errors thrown are of this type.
export class SentryError extends Error {
  public readonly context: Partial<ScopeContext>

  constructor(
    message: string,
    options: {
      name?: string
      cause?: Error
      context?: Partial<ScopeContext>
    } = {}
  ) {
    const { cause, context, name } = options

    super(message, { cause })
    this.name = name || this.constructor.name

    this.context = context || {}

    if (cause instanceof Error && cause.stack) {
      this.stack = cause.stack
    }
  }
}

// Ensures returned value is an Error type.
export function ensureError(value: unknown): Error & { shortMessage?: string; digest?: string } {
  if (value instanceof Error) return value

  let stringified = '[Unable to stringify thrown value]'
  try {
    stringified = JSON.stringify(value)
  } catch {
    /* empty */
  }

  const shortMessage = stringified
  const error = new ErrorWithShortMessage(
    `This value was thrown as is, not through an Error: ${stringified}`,
    shortMessage
  )

  return error
}

class ErrorWithShortMessage extends Error {
  shortMessage: string

  constructor(message: string, shortMessage: string) {
    super(message)
    this.shortMessage = shortMessage

    Object.setPrototypeOf(this, ErrorWithShortMessage.prototype)
  }
}

type QueryMeta = {
  context?: {
    extra?: {
      params?: { chainId?: number; blockNumber?: bigint }
    }
  }
}

/*
  When present, it parses the build call data from the error message and builds a tenderly simulation url.
*/
export function getTenderlyUrlFromErrorMessage(
  error: Error,
  queryMeta?: QueryMeta
): string | undefined {
  const queryParams = queryMeta?.context?.extra?.params
  const chainId = queryParams?.chainId
  if (!chainId) return

  const txConfig = parseRequestError(error, chainId)
  if (!txConfig) return

  return buildTenderlyUrl({ txConfig, blockNumber: queryParams?.blockNumber })
}

/*
  When present, parses viem's exception message to extract the transaction config (build call data)
*/
function parseRequestError(error: Error, chainId: number): TransactionConfig | undefined {
  if (!error.message.startsWith('RPC Request failed')) return
  const requestBodyRegex = /Request body: ({.*})/

  const match = error?.stack?.match(requestBodyRegex)

  if (match && match[1]) {
    const jsonString = match[1]

    try {
      const parsedBody = JSON.parse(jsonString)
      const rawCall = parsedBody?.params?.[0]
      if (rawCall) {
        const txConfig: TransactionConfig = {
          data: rawCall.data,
          to: rawCall.to,
          account: rawCall.from,
          chainId,
        }
        if (!txConfig.account) {
          txConfig.account = '0x0000000000000000000000000000000000000000' // Unknown account in tenderly
        }
        return txConfig
      }
    } catch (error) {
      // Ignore errors when parsing
      return
    }
  }

  return
}
