'use client'

/**
 * Module-level request cache + in-flight dedupe for client-side fetches.
 *
 * Generalizes the store that `lib/snapshots/useProtocolSnapshots.ts` grew
 * inline. The problem it solves is the same wherever two components read the
 * same feed: each hook instance owns its own `useEffect` + `fetch`, so two
 * consumers mounting in the same commit fire two identical requests. The
 * browser HTTP cache does NOT save you here — concurrent requests race before
 * either response exists to cache, so both reach the origin. `/portfolio`
 * mounted `useMerklRewards` + `useGaugeRewards` from two cards and paid 4
 * requests for 2 payloads; `/governance` did the same with `bal-supply`.
 *
 *   - `inflight` folds concurrent callers with the same key onto one promise.
 *   - `settled` reuses the parsed value within `ttlMs`, skipping the network
 *     roundtrip and the JSON parse entirely.
 *
 * Errors evict the entry so the next mount retries cleanly rather than
 * caching a failure.
 *
 * NOTE ON ABORT: the shared promise deliberately runs without any single
 * caller's `AbortSignal` — one consumer unmounting must not cancel a fetch
 * another is still awaiting. Callers should ignore late results via a
 * `cancelled` flag rather than aborting (same contract as
 * `useProtocolSnapshots`).
 */

type Entry =
  | { state: 'inflight'; promise: Promise<unknown> }
  | { state: 'settled'; data: unknown; ts: number }

const cache = new Map<string, Entry>()

/**
 * Synchronous read of a fresh cached value, or `null`. Use to seed
 * `useState` so a second consumer mounts without a loading flicker.
 */
export function peekCached<T>(key: string, ttlMs: number): T | null {
  const e = cache.get(key)
  if (e?.state === 'settled' && Date.now() - e.ts < ttlMs) return e.data as T
  return null
}

/**
 * Run `load` under `key`, folding concurrent callers onto one promise and
 * reusing the settled value for `ttlMs`. `key` should uniquely identify the
 * request — the URL is usually the right choice.
 */
export function dedupedLoad<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const e = cache.get(key)
  if (e?.state === 'inflight') return e.promise as Promise<T>
  if (e?.state === 'settled' && Date.now() - e.ts < ttlMs) return Promise.resolve(e.data as T)

  const promise = load()
    .then(data => {
      cache.set(key, { state: 'settled', data, ts: Date.now() })
      return data
    })
    .catch(err => {
      cache.delete(key)
      throw err
    })
  cache.set(key, { state: 'inflight', promise })
  return promise
}
