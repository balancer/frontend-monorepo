'use client'

import { useEffect, useMemo, useState } from 'react'

type Status = 'idle' | 'loading' | 'resolved' | 'invalid' | 'not_found' | 'error'

export type EnsResolution = {
  status: Status
  address: string | null
  /** The normalised input we resolved against — useful for debounce display. */
  input: string | null
}

type AsyncResult =
  | { kind: 'pending'; input: string }
  | { kind: 'resolved'; input: string; address: string }
  | { kind: 'not_found'; input: string }
  | { kind: 'error'; input: string }

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

function isEnsCandidate(input: string): boolean {
  return input.toLowerCase().endsWith('.eth')
}

/**
 * Resolve either a raw `0x…` address or an ENS name to a checksum address.
 * Server-side ENS resolution lives at `/api/ens/[name]`; this hook branches
 * on the literal address shape (computed during render) and only uses an
 * effect + state for the async ENS roundtrip.
 *
 * Returns an `idle` resolution when input is empty so consumers can keep
 * their `<Button isDisabled>` logic simple.
 */
export function useEnsResolution(input: string, debounceMs = 400): EnsResolution {
  const trimmed = input.trim()
  // Async result tracks only the ENS branch — synchronous cases (empty
  // input, raw address, invalid format) are derived in render below so we
  // don't bounce through an extra setState round-trip.
  const [asyncResult, setAsyncResult] = useState<AsyncResult | null>(null)
  const needsAsync = trimmed.length > 0 && !ADDRESS_RE.test(trimmed) && isEnsCandidate(trimmed)

  // Memoize the latest asyncResult slug separately so the effect's deps
  // stay shallow — we only want to refire when input changes, not on every
  // pending → resolved transition (which would loop).
  const hasFreshResult =
    asyncResult?.input === trimmed && asyncResult.kind !== 'pending'

  useEffect(() => {
    if (!needsAsync) return
    if (hasFreshResult) return
    const controller = new AbortController()
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ens/${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          setAsyncResult({
            kind: res.status === 404 ? 'not_found' : 'error',
            input: trimmed,
          })
          return
        }
        const body = (await res.json()) as { address: string | null }
        if (body.address) {
          setAsyncResult({ kind: 'resolved', input: trimmed, address: body.address })
        } else {
          setAsyncResult({ kind: 'not_found', input: trimmed })
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setAsyncResult({ kind: 'error', input: trimmed })
      }
    }, debounceMs)

    return () => {
      controller.abort()
      clearTimeout(id)
    }
  }, [trimmed, debounceMs, needsAsync, hasFreshResult])

  return useMemo<EnsResolution>(() => {
    if (!trimmed) return { status: 'idle', address: null, input: null }
    if (ADDRESS_RE.test(trimmed)) {
      return { status: 'resolved', address: trimmed, input: trimmed }
    }
    if (!isEnsCandidate(trimmed)) {
      return { status: 'invalid', address: null, input: trimmed }
    }
    // ENS branch — derive from async state, defaulting to 'loading' until
    // the first effect run lands.
    if (!asyncResult || asyncResult.input !== trimmed) {
      return { status: 'loading', address: null, input: trimmed }
    }
    switch (asyncResult.kind) {
      case 'pending':
        return { status: 'loading', address: null, input: trimmed }
      case 'resolved':
        return { status: 'resolved', address: asyncResult.address, input: trimmed }
      case 'not_found':
        return { status: 'not_found', address: null, input: trimmed }
      case 'error':
        return { status: 'error', address: null, input: trimmed }
    }
  }, [trimmed, asyncResult])
}
