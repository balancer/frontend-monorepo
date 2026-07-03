'use client'

import { useEffect, useState } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import type { GqlChainValues } from '@repo/lib/config/networks'
import { chainToSlugMap } from '@repo/lib/modules/pool/pool.utils'
import { fetchWithRetry } from '@analytics/lib/upstream/fetch-retry'
import type { OrderFlowResponse } from './api-types'

/** Typed error code returned by the order-flow route. Drives the UI's
 *  empty-state copy — rate-limit errors get a "wait and retry" message
 *  instead of the generic "something broke" fallback. */
export type OrderFlowErrorCode =
  | 'rate_limited'
  | 'upstream_unreachable'
  | 'upstream_error'
  | 'upstream_graphql_error'
  | 'internal_error'
  | 'network_error'
  | 'unknown_error'

export class OrderFlowError extends Error {
  readonly code: OrderFlowErrorCode
  readonly status: number | null
  /** Friendly, user-facing message supplied by the route when available
   *  (currently only for rate-limit errors). Falls back to the code. */
  readonly userMessage: string | null
  constructor(
    code: OrderFlowErrorCode,
    message: string,
    status: number | null = null,
    userMessage: string | null = null
  ) {
    super(message)
    this.name = 'OrderFlowError'
    this.code = code
    this.status = status
    this.userMessage = userMessage
  }
}

type State = {
  data: OrderFlowResponse | null
  error: OrderFlowError | null
}

type Result = State & { loading: boolean }

const INITIAL: State = { data: null, error: null }

/** Status values 429/503/504 are treated as rate-limit signals downstream too —
 *  matches the route's `isRateLimitStatus` so the UI behaves correctly even
 *  if the request never reaches the route (e.g. browser hits a CDN's WAF). */
function statusToErrorCode(status: number): OrderFlowErrorCode {
  if (status === 429 || status === 503 || status === 504) return 'rate_limited'
  if (status >= 500) return 'upstream_error'
  return 'unknown_error'
}

/**
 * Fetches the 30d labeled-swap feed from `/api/pool/[chain]/[id]/order-flow`.
 *
 * Crucially, this hook does **not** take a range parameter — the server
 * always returns 30d and the component filters in-memory. That's the
 * single biggest piece of rate-limit insurance: switching ranges in the
 * UI never re-hits api-v3.
 *
 * Mirrors the plain fetch + useState + useEffect pattern used elsewhere
 * in this app (see `useBiggestSwaps`). The route's `Cache-Control:
 * s-maxage=600` covers cross-tab revisits within 10 minutes.
 *
 * Errors are returned as `OrderFlowError` with a typed `code` so the
 * caller can render different empty-state copy for rate limits vs. other
 * failure modes.
 */
export function usePoolOrderFlowData(
  chain: GqlChainValues,
  poolId: string
): Result {
  const slug = chainToSlugMap[chain as GqlChain]
  const [state, setState] = useState<State>(INITIAL)

  useEffect(() => {
    if (!slug) return
    const url = `/api/pool/${slug}/${poolId.toLowerCase()}/order-flow`
    // Abort if the component unmounts or pool changes before the response
    // arrives. The previous range-keyed effect could pile up parallel api-v3
    // calls; this version only re-fires when chain/pool change so the
    // abort is mostly for unmount cleanup.
    const controller = new AbortController()
    fetchWithRetry(url, { signal: controller.signal })
      .then(async r => {
        if (r.ok) return (await r.json()) as OrderFlowResponse
        // Try to read the structured `{ error, message, detail }` body the
        // route returns on failure. Fall back to status-based detection if
        // the body isn't JSON (e.g. the request never reached our route and
        // a CDN returned an HTML error page).
        let code: OrderFlowErrorCode = statusToErrorCode(r.status)
        let userMessage: string | null = null
        let detail = `order-flow HTTP ${r.status}`
        try {
          const body = (await r.json()) as {
            error?: string
            message?: string
            detail?: string
          }
          if (typeof body.error === 'string') {
            code = (body.error as OrderFlowErrorCode) ?? code
          }
          if (typeof body.message === 'string') userMessage = body.message
          if (typeof body.detail === 'string') detail = body.detail
        } catch {
          // Body wasn't JSON; keep status-derived code and message.
        }
        throw new OrderFlowError(code, detail, r.status, userMessage)
      })
      .then(data => {
        if (controller.signal.aborted) return
        setState({ data, error: null })
      })
      .catch(error => {
        if (controller.signal.aborted) return
        if (error instanceof Error && error.name === 'AbortError') return
        const wrapped =
          error instanceof OrderFlowError
            ? error
            : new OrderFlowError(
                'network_error',
                error instanceof Error ? error.message : String(error)
              )
        setState(prev => ({ data: prev.data, error: wrapped }))
      })
    return () => {
      controller.abort()
    }
  }, [slug, poolId])

  if (!slug) {
    return {
      data: null,
      loading: false,
      error: new OrderFlowError('internal_error', `no URL slug for ${chain}`),
    }
  }
  // Loading is derived: we're "loading" until there's data or an error.
  const loading = state.data == null && state.error == null
  return { data: state.data, error: state.error, loading }
}
