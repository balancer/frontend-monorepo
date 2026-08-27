import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchAllDuneLabels } from './fetch-labels'

function duneResponse(rows: unknown[], nextUri?: string) {
  return new Response(
    JSON.stringify({ result: { rows }, ...(nextUri ? { next_uri: nextUri } : {}) }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

describe('fetchAllDuneLabels', () => {
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
    await expect(fetchAllDuneLabels()).rejects.toThrow('NEXT_PRIVATE_DUNE_API_KEY')
  })

  it('returns rows from a single page', async () => {
    fetchMock.mockResolvedValue(
      duneResponse([{ address: '0xaaa', name: '1Inch', blockchain: 'ethereum' }])
    )

    const { rows, pages } = await fetchAllDuneLabels()
    expect(rows).toHaveLength(1)
    expect(pages).toBe(1)
  })

  it('follows next_uri across pages', async () => {
    fetchMock
      .mockResolvedValueOnce(
        duneResponse([{ address: '0xaaa', name: 'A', blockchain: 'ethereum' }], 'https://next/2')
      )
      .mockResolvedValueOnce(
        duneResponse([{ address: '0xbbb', name: 'B', blockchain: 'ethereum' }])
      )

    const { rows, pages } = await fetchAllDuneLabels()
    expect(rows).toHaveLength(2)
    expect(pages).toBe(2)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('stops when a page has no rows', async () => {
    fetchMock.mockResolvedValue(duneResponse([]))
    const { rows, pages } = await fetchAllDuneLabels()
    expect(rows).toHaveLength(0)
    expect(pages).toBe(1)
  })

  it('throws on a Dune error payload', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: 'boom' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await expect(fetchAllDuneLabels()).rejects.toThrow('dune error')
  })
})
