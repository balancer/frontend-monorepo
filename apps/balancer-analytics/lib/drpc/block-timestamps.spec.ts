import { describe, expect, it, vi } from 'vitest'
import { resolveBlockTimestamps } from './block-timestamps'

type MockClient = {
  getBlock: ReturnType<typeof vi.fn>
}

function makeClient(): MockClient {
  return { getBlock: vi.fn() }
}

describe('resolveBlockTimestamps', () => {
  it('resolves timestamps for each unique block', async () => {
    const client = makeClient()

    client.getBlock.mockImplementation(async ({ blockNumber }) => ({
      number: blockNumber,
      timestamp: BigInt(Number(blockNumber) * 1000),
    }))

    const map = await resolveBlockTimestamps(client as never, 'MAINNET' as never, [1n, 2n, 3n])
    expect(map.get(1n)).toBe(1000)
    expect(map.get(2n)).toBe(2000)
    expect(map.get(3n)).toBe(3000)
    expect(client.getBlock).toHaveBeenCalledTimes(3)
  })

  it('dedupes repeated blocks into a single RPC call', async () => {
    const client = makeClient()

    client.getBlock.mockImplementation(async ({ blockNumber }) => ({
      number: blockNumber,
      timestamp: 1000n,
    }))

    const map = await resolveBlockTimestamps(client as never, 'MAINNET' as never, [1n, 1n, 1n, 2n])
    expect(map.size).toBe(2)
    expect(client.getBlock).toHaveBeenCalledTimes(2)
  })

  it('returns an empty map for no blocks', async () => {
    const client = makeClient()
    const map = await resolveBlockTimestamps(client as never, 'MAINNET' as never, [])
    expect(map.size).toBe(0)
    expect(client.getBlock).not.toHaveBeenCalled()
  })
})
