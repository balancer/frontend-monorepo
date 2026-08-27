import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWithRetry } from './fetch-retry'

function response(status: number, headers: Record<string, string> = {}): Response {
  return new Response(null, { status, headers })
}

describe('fetchWithRetry', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  async function runWithTimers<T>(promise: Promise<T>): Promise<T> {
    // Advance fake timers until the promise settles (backoff sleeps resolve).
    let settled = false

    // Attach both handlers so a rejection is consumed here and the caller's
    // own `await expect(...).rejects` handles it without an unhandled error.
    promise.then(
      () => {
        settled = true
      },
      () => {
        settled = true
      }
    )

    while (!settled) {
      await vi.advanceTimersByTimeAsync(10_000)
    }

    return promise
  }

  it('returns the response on first success', async () => {
    fetchMock.mockResolvedValue(response(200))
    const res = await fetchWithRetry('https://x')
    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries transient 503 then succeeds', async () => {
    fetchMock.mockResolvedValueOnce(response(503)).mockResolvedValueOnce(response(200))
    const p = fetchWithRetry('https://x')
    const res = await runWithTimers(p)
    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('gives up after exhausting retries and returns the last response', async () => {
    fetchMock.mockResolvedValue(response(503))
    const p = fetchWithRetry('https://x', { retries: 2 })
    const res = await runWithTimers(p)
    expect(res.status).toBe(503)
    expect(fetchMock).toHaveBeenCalledTimes(3) // initial + 2 retries
  })

  it('does not retry non-transient errors (e.g. 404)', async () => {
    fetchMock.mockResolvedValue(response(404))
    const res = await fetchWithRetry('https://x')
    expect(res.status).toBe(404)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('honors Retry-After on 429 up to the ceiling', async () => {
    fetchMock
      .mockResolvedValueOnce(response(429, { 'retry-after': '2' }))
      .mockResolvedValueOnce(response(200))

    const p = fetchWithRetry('https://x')
    const res = await runWithTimers(p)
    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('rethrows network errors after retries are exhausted', async () => {
    fetchMock.mockRejectedValue(new Error('network down'))
    const p = fetchWithRetry('https://x', { retries: 1 })
    await expect(runWithTimers(p)).rejects.toThrow('network down')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('rethrows AbortError immediately without retrying', async () => {
    const abortErr = new Error('Aborted')
    abortErr.name = 'AbortError'
    fetchMock.mockRejectedValue(abortErr)
    await expect(fetchWithRetry('https://x', { retries: 3 })).rejects.toThrow('Aborted')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
