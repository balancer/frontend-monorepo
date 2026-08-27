import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { chunkedGetLogs } from './get-logs'
import type { DecodedLog } from './get-logs'

type MockClient = {
  getLogs: ReturnType<typeof vi.fn>
}

function makeClient(): MockClient {
  return { getLogs: vi.fn() }
}

function log(blockNumber: bigint): DecodedLog {
  return {
    address: '0xpool',
    blockHash: '0xhash',
    blockNumber,
    data: '0x',
    logIndex: 0,
    transactionHash: '0xabc',
    transactionIndex: 0,
    removed: false,
    topics: ['0xabc'],
    eventName: 'SwapFeePercentageChanged',
    args: {},
  } as DecodedLog
}

function rangeError(message: string): Error {
  const err = new Error(message)

  ;(err as { shortMessage?: string }).shortMessage = message
  return err
}

describe('chunkedGetLogs', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns [] when toBlock is before fromBlock', async () => {
    const client = makeClient()
    const logs = await chunkedGetLogs(client as never, { fromBlock: 10n, toBlock: 5n })
    expect(logs).toEqual([])
    expect(client.getLogs).not.toHaveBeenCalled()
  })

  it('fetches a single chunk and returns its logs', async () => {
    const client = makeClient()
    client.getLogs.mockResolvedValue([log(1n), log(2n)])
    const logs = await chunkedGetLogs(client as never, { fromBlock: 1n, toBlock: 2n })
    expect(logs).toHaveLength(2)
    expect(client.getLogs).toHaveBeenCalledTimes(1)
  })

  it('splits a wide range into multiple chunks', async () => {
    const client = makeClient()
    client.getLogs.mockImplementation(async ({ fromBlock }) => [log(fromBlock)])

    const logs = await chunkedGetLogs(client as never, {
      fromBlock: 1n,
      toBlock: 100_000n,
      chunkSize: 50_000n,
    })

    // 1..50000, 50001..100000 → two chunks
    expect(logs).toHaveLength(2)
    expect(client.getLogs).toHaveBeenCalledTimes(2)
  })

  it('retries transient errors in place then succeeds', async () => {
    const client = makeClient()

    client.getLogs
      .mockRejectedValueOnce(rangeError('temporary internal error'))
      .mockResolvedValueOnce([log(1n)])

    const p = chunkedGetLogs(client as never, { fromBlock: 1n, toBlock: 2n })
    // Advance fake timers so the transient backoff resolves.
    let settled = false

    p.then(
      () => {
        settled = true
      },
      () => {
        settled = true
      }
    )

    while (!settled) await vi.advanceTimersByTimeAsync(10_000)
    const logs = await p
    expect(logs).toHaveLength(1)
    expect(client.getLogs).toHaveBeenCalledTimes(2)
  })

  it('splits a range in half on a range-too-large error', async () => {
    const client = makeClient()

    // MIN_CHUNK_SIZE is 1000 blocks; ranges above that split, below succeed.
    client.getLogs.mockImplementation(async (params: { fromBlock: bigint; toBlock: bigint }) => {
      const { fromBlock, toBlock } = params
      if (toBlock - fromBlock + 1n > 1000n) throw rangeError('block range too large')
      return [log(fromBlock)]
    })

    const logs = await chunkedGetLogs(client as never, {
      fromBlock: 1n,
      toBlock: 5000n,
      chunkSize: 5000n,
    })

    // Splits until each sub-range is ≤ 1000 blocks, then returns one log each.
    expect(logs.length).toBeGreaterThan(1)
  })

  it('rethrows a non-transient, non-range error', async () => {
    const client = makeClient()
    client.getLogs.mockRejectedValue(new Error('boom'))

    await expect(
      chunkedGetLogs(client as never, { fromBlock: 1n, toBlock: 2n, chunkSize: 2n })
    ).rejects.toThrow('boom')
  })
})
