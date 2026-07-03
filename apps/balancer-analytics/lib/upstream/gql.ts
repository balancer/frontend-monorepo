/**
 * Shared upstream GraphQL fetch + typed error handling.
 *
 * Replaces the per-route bespoke `gqlFetch` helpers that historically
 * differed in how (or whether) they distinguished rate-limit responses
 * from other upstream failures. Routes hitting an external GraphQL
 * endpoint (api-v3, Snapshot.org, …) should fetch through `gqlFetch` and
 * map any thrown `UpstreamError` to a structured response via
 * `upstreamErrorToResponse`.
 *
 * Rate-limit detection covers 429 (canonical) plus 503/504 (commonly
 * surfaced by upstream proxies during throttling bursts). Treating all
 * three as "rate limit" matches what the user actually experiences — "the
 * API is refusing my requests, I should wait."
 */

import 'server-only'

export type UpstreamErrorKind =
  | 'rate_limit'
  | 'upstream_error'
  | 'graphql_error'
  | 'network'

export class UpstreamError extends Error {
  readonly kind: UpstreamErrorKind
  readonly status: number | null
  readonly retryAfter: string | null
  /** Short identifier for which upstream produced the error. Logged on
   *  the server side so a rate-limit blip on Snapshot doesn't get mixed
   *  up with one on api-v3. Not surfaced to the client. */
  readonly upstream: string

  constructor(
    upstream: string,
    kind: UpstreamErrorKind,
    message: string,
    status: number | null = null,
    retryAfter: string | null = null
  ) {
    super(message)
    this.name = 'UpstreamError'
    this.upstream = upstream
    this.kind = kind
    this.status = status
    this.retryAfter = retryAfter
  }
}

export function isRateLimitStatus(status: number): boolean {
  return status === 429 || status === 503 || status === 504
}

export type GqlFetchOptions = {
  /** Short upstream identifier — `'api-v3'`, `'snapshot'`, etc. Used in
   *  error messages and server logs to disambiguate which upstream
   *  failed. */
  upstream: string
  /** Short label for the specific query, used in logs ("poolGetPool",
   *  "biggest-swaps"). Helps triage a generic 429 by surfacing which
   *  call hit the limit. */
  label: string
  /** Cache strategy. Default: `'no-store'` (bypass Next Data Cache).
   *  Pass `{ revalidate: N }` to opt into the data cache with a TTL. */
  cache?: 'no-store' | { revalidate: number }
}

/**
 * GraphQL fetch with typed upstream-error handling. Returns the `data`
 * field directly; throws `UpstreamError` on transport / rate-limit /
 * graphql failures so the caller can route them to the right response.
 *
 * `data` may be `null` even on success (the upstream resolver returned
 * null for the requested field) — that's a legitimate "not found", not an
 * error. Distinguishing it is the caller's job.
 */
export async function gqlFetch<T>(
  url: string,
  query: string,
  variables: Record<string, unknown>,
  options: GqlFetchOptions
): Promise<T | null> {
  const cacheOptions: RequestInit =
    options.cache === 'no-store' || options.cache === undefined
      ? { cache: 'no-store' }
      : { next: { revalidate: options.cache.revalidate } }

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      ...cacheOptions,
    })
  } catch (err) {
    // Pre-response error — DNS, connection refused, abort. Surface as a
    // network-class upstream error so the caller can show a "couldn't
    // reach the API" message instead of a generic 500.
    throw new UpstreamError(
      options.upstream,
      'network',
      `${options.upstream} ${options.label} network error: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  if (!res.ok) {
    const retryAfter = res.headers.get('retry-after')
    console.warn(
      `[${options.upstream}] ${options.label} HTTP ${res.status}`,
      { variables, retryAfter }
    )
    const kind: UpstreamErrorKind = isRateLimitStatus(res.status)
      ? 'rate_limit'
      : 'upstream_error'
    throw new UpstreamError(
      options.upstream,
      kind,
      `${options.upstream} ${options.label} HTTP ${res.status}`,
      res.status,
      retryAfter
    )
  }

  const json = (await res.json()) as { data?: T; errors?: unknown }
  if (json.errors) {
    console.warn(`[${options.upstream}] ${options.label} GraphQL errors`, {
      variables,
      errors: json.errors,
    })
    // GraphQL-level errors with a 200 status are typically schema/query
    // problems, not capacity. Treat as upstream_error so the user sees
    // a "something's off" rather than a fake "rate limited".
    throw new UpstreamError(
      options.upstream,
      'graphql_error',
      `${options.upstream} ${options.label} GraphQL error`,
      200,
      null
    )
  }
  return json.data ?? null
}

/**
 * Maps an `UpstreamError` to (status, response body, headers) for a
 * Next.js route handler. Centralizes the wire shape so a client sees
 * the same `error` codes regardless of which route caught the failure.
 *
 * Always returns 429 for rate limits (mirrors upstream semantics, lets
 * any future browser-side retry act sensibly) and 502 for other upstream
 * failures.
 */
export function upstreamErrorToResponse(
  err: UpstreamError,
  options: { includeDevDetail?: boolean } = {}
): { status: number; body: Record<string, unknown>; headers: Record<string, string> } {
  const isRateLimit = err.kind === 'rate_limit'
  const status = isRateLimit ? 429 : 502

  const errorCode = isRateLimit
    ? 'rate_limited'
    : err.kind === 'network'
      ? 'upstream_unreachable'
      : err.kind === 'graphql_error'
        ? 'upstream_graphql_error'
        : 'upstream_error'

  const body: Record<string, unknown> = { error: errorCode }
  if (isRateLimit) {
    body.message =
      `${err.upstream} API rate limit reached. Please wait a minute and try again.`
  }
  if (options.includeDevDetail) {
    body.detail = err.message
  }

  const headers: Record<string, string> = { 'Cache-Control': 'no-store' }
  if (isRateLimit) {
    // Forward the upstream's hint when present; otherwise default to 60s
    // (typical per-IP bucket refill).
    headers['Retry-After'] = err.retryAfter ?? '60'
  }

  return { status, body, headers }
}
