/**
 * Client-safe fetch wrapper with bounded retry on transient errors.
 *
 * Use this from React hooks (`usePoolEvents`, `useBiggestSwaps`, etc.) so
 * a single transient upstream blip doesn't surface as an error UI — most
 * 429/503/504 responses clear within a few hundred ms and the user never
 * needs to know. Retries are bounded to keep the UI from sitting on a
 * dead request forever; failures past the cap propagate as a normal
 * non-OK Response (or thrown network error) for the hook to handle.
 *
 * No server-only imports here — this module is safe in the browser.
 */

const DEFAULT_RETRIES = 1
const DEFAULT_MAX_BACKOFF_MS = 5_000
const BASE_BACKOFF_MS = 500
/** Cap parsed `Retry-After` values — the upstream may suggest a longer
 *  delay than the user would tolerate before seeing the empty / error
 *  state. We respect the hint up to this ceiling. */
const RETRY_AFTER_CEILING_MS = 60_000

export type FetchRetryOptions = RequestInit & {
  /** Max retries on transient errors. Default 1 (i.e. at most 2 total
   *  attempts). */
  retries?: number
  /** Cap on the auto-derived exponential backoff between attempts. Does
   *  NOT cap the parsed `Retry-After` value beyond {@link
   *  RETRY_AFTER_CEILING_MS}. Default 5s. */
  maxBackoffMs?: number
}

/** 429 = canonical rate limit. 503/504 = upstream proxies during throttling
 *  bursts. Both are retryable from the client's perspective. Other 5xx are
 *  retryable too (likely transient deploy / pod restart). */
function isTransientStatus(status: number): boolean {
  if (status === 429 || status === 503 || status === 504) return true
  return status >= 500 && status < 600
}

function parseRetryAfterMs(header: string | null): number | null {
  if (!header) return null
  const n = Number(header)
  if (Number.isFinite(n) && n > 0) {
    return Math.min(RETRY_AFTER_CEILING_MS, Math.round(n * 1000))
  }
  // Retry-After may also be an HTTP-date. We don't parse it — the typical
  // case from the routes I control is integer seconds. Fall back to the
  // default backoff schedule when the header isn't a plain number.
  return null
}

function backoffFor(attempt: number, max: number): number {
  // 500ms, 1s, 2s, 4s, capped by `max`. Attempt is 1-indexed at call.
  return Math.min(max, BASE_BACKOFF_MS * Math.pow(2, attempt - 1))
}

function delay(ms: number, signal?: AbortSignal | null): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signalAbortError(signal))
      return
    }
    const t = setTimeout(resolve, ms)
    if (signal) {
      const onAbort = () => {
        clearTimeout(t)
        reject(signalAbortError(signal))
      }
      signal.addEventListener('abort', onAbort, { once: true })
    }
  })
}

function signalAbortError(signal: AbortSignal): Error {
  // Prefer the platform's AbortError shape so callers' `error.name === 'AbortError'`
  // guards work without us reinventing the type.
  if (typeof DOMException !== 'undefined') {
    return new DOMException(signal.reason?.message ?? 'Aborted', 'AbortError')
  }
  const err = new Error('Aborted')
  err.name = 'AbortError'
  return err
}

/**
 * Drop-in `fetch` replacement that retries transient failures. Returns the
 * final `Response` (whether OK or not) so the caller can inspect status
 * and parse the body the same way they would after a plain `fetch`.
 *
 * Honors `Retry-After` on 429 responses up to 60s; otherwise uses
 * exponential backoff (500ms → 1s → 2s → 4s, capped by `maxBackoffMs`).
 *
 * Aborts cleanly when `signal` fires — even during a backoff sleep — and
 * re-throws an AbortError so the caller's `error.name === 'AbortError'`
 * branch still works.
 */
export async function fetchWithRetry(
  url: string,
  options: FetchRetryOptions = {}
): Promise<Response> {
  const {
    retries = DEFAULT_RETRIES,
    maxBackoffMs = DEFAULT_MAX_BACKOFF_MS,
    ...init
  } = options
  const signal = init.signal ?? null

  let attempt = 0
  while (true) {
    let res: Response
    try {
      res = await fetch(url, init)
    } catch (err) {
      if (
        attempt >= retries ||
        (err instanceof Error && err.name === 'AbortError')
      ) {
        throw err
      }
      attempt++
      await delay(backoffFor(attempt, maxBackoffMs), signal)
      continue
    }

    if (res.ok || !isTransientStatus(res.status) || attempt >= retries) {
      return res
    }
    attempt++
    const hinted = parseRetryAfterMs(res.headers.get('retry-after'))
    const wait = hinted ?? backoffFor(attempt, maxBackoffMs)
    await delay(wait, signal)
  }
}
