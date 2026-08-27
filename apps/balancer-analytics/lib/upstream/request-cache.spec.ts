import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { dedupedLoad, peekCached } from './request-cache'

describe('request-cache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('caches the settled value within the TTL', async () => {
    const load = vi.fn().mockResolvedValue('data')
    const a = await dedupedLoad('k1', 1000, load)
    const b = await dedupedLoad('k1', 1000, load)
    expect(a).toBe('data')
    expect(b).toBe('data')
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('folds concurrent callers onto a single in-flight promise', async () => {
    let resolveLoad: (v: string) => void = () => {}

    const load = vi.fn().mockImplementation(
      () =>
        new Promise<string>(resolve => {
          resolveLoad = resolve
        })
    )

    const p1 = dedupedLoad('k2', 1000, load)
    const p2 = dedupedLoad('k2', 1000, load)
    expect(load).toHaveBeenCalledTimes(1)

    resolveLoad('data')
    await expect(p1).resolves.toBe('data')
    await expect(p2).resolves.toBe('data')
  })

  it('re-fetches after the TTL expires', async () => {
    const load = vi.fn().mockResolvedValue('data')
    await dedupedLoad('k3', 1000, load)
    await vi.advanceTimersByTimeAsync(1001)
    await dedupedLoad('k3', 1000, load)
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('evicts the entry on error so the next call retries', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce('ok')
    await expect(dedupedLoad('k4', 1000, load)).rejects.toThrow('boom')
    const res = await dedupedLoad('k4', 1000, load)
    expect(res).toBe('ok')
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('peekCached returns fresh data or null', async () => {
    expect(peekCached('k5', 1000)).toBeNull()
    await dedupedLoad('k5', 1000, vi.fn().mockResolvedValue('data'))
    expect(peekCached('k5', 1000)).toBe('data')
    await vi.advanceTimersByTimeAsync(1001)
    expect(peekCached('k5', 1000)).toBeNull()
  })
})
