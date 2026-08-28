import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchVeBalHoldersSnapshot } from './fetch-vebal-holders'

function duneResponse(rows: unknown[]) {
  return new Response(JSON.stringify({ result: { rows } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('fetchVeBalHoldersSnapshot', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    process.env.NEXT_PRIVATE_DUNE_API_KEY = 'test-key'
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.NEXT_PRIVATE_DUNE_API_KEY
  })

  it('throws when the API key is missing', async () => {
    delete process.env.NEXT_PRIVATE_DUNE_API_KEY
    await expect(fetchVeBalHoldersSnapshot()).rejects.toThrow('NEXT_PRIVATE_DUNE_API_KEY')
  })

  it('returns the latest day only, sorted by pct descending', async () => {
    fetchMock.mockResolvedValue(
      duneResponse([
        {
          day: '2026-06-04 00:00:00',
          wallet_address: '0xaaa',
          provider: 'Aura',
          vebal_balance: 100,
          pct: 0.1,
        },
        {
          day: '2026-06-05 00:00:00',
          wallet_address: '0xbbb',
          provider: 'Humpy',
          vebal_balance: 500,
          pct: 0.5,
        },
        {
          day: '2026-06-05 00:00:00',
          wallet_address: '0xccc',
          provider: '0xccc',
          vebal_balance: 200,
          pct: 0.2,
        },
      ])
    )

    const snap = await fetchVeBalHoldersSnapshot()
    expect(snap.day).toBe('2026-06-05 00:00:00')
    expect(snap.rows).toHaveLength(2)
    expect(snap.rows[0].provider).toBe('Humpy')
    expect(snap.rows[0].pct).toBe(0.5)
    expect(snap.rows[1].provider).toBe('0xccc')
  })

  it('lowercases wallet addresses and coerces numeric strings', async () => {
    fetchMock.mockResolvedValue(
      duneResponse([
        {
          day: '2026-06-05 00:00:00',
          wallet_address: '0xABC',
          provider: 'Aura',
          vebal_balance: '100',
          pct: '0.1',
        },
      ])
    )

    const snap = await fetchVeBalHoldersSnapshot()
    expect(snap.rows[0].walletAddress).toBe('0xabc')
    expect(snap.rows[0].veBalBalance).toBe(100)
    expect(snap.rows[0].pct).toBe(0.1)
  })

  it('returns empty rows when the result set is empty', async () => {
    fetchMock.mockResolvedValue(duneResponse([]))
    const snap = await fetchVeBalHoldersSnapshot()
    expect(snap.day).toBe('')
    expect(snap.rows).toHaveLength(0)
  })
})
