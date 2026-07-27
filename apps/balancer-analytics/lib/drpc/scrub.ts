/**
 * Strip the drpc API key from anything that's about to be logged or sent
 * to the client. viem's `HttpRequestError` includes the full URL in both
 * its `url` field and the (already-serialized) `message` string, so a
 * naive `console.error(err)` leaks the secret to terminal and any log
 * collector that scrapes stdout.
 *
 * The scrubber reads `NEXT_PRIVATE_DRPC_KEY` once per call (rather than
 * caching at module-load) so a key rotation during a long-running dev
 * server still gets caught. Falsy keys short-circuit — no replacement to
 * do, no risk of an empty-string replacement turning `lb.drpc.live//`
 * into a confused error.
 */

import 'server-only'

const REDACTED = '***'

export function scrubSecret(input: unknown): string {
  const text = typeof input === 'string' ? input : JSON.stringify(input)
  const key = process.env.NEXT_PRIVATE_DRPC_KEY
  if (!key || !text) return text
  return text.split(key).join(REDACTED)
}

/**
 * Best-effort copy of a (possibly viem-typed) error object with secret
 * material redacted from string-valued fields. The result is safe to
 * `console.error` or return in an HTTP error body — anything we missed
 * still goes through `scrubSecret` if the caller wraps it.
 */
export function scrubError(err: unknown): Record<string, unknown> {
  const e = err as {
    name?: string
    message?: string
    shortMessage?: string
    details?: string
    url?: string
    status?: number
    body?: unknown
    cause?: { message?: string; name?: string }
  }
  return {
    name: e?.name,
    shortMessage: e?.shortMessage ? scrubSecret(e.shortMessage) : undefined,
    message: e?.message ? scrubSecret(e.message) : undefined,
    details: e?.details ? scrubSecret(e.details) : undefined,
    url: e?.url ? scrubSecret(e.url) : undefined,
    status: e?.status,
    body: e?.body !== undefined ? scrubSecret(e.body) : undefined,
    causeName: e?.cause?.name,
    causeMessage: e?.cause?.message ? scrubSecret(e.cause.message) : undefined,
  }
}
