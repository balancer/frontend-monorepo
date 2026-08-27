import { describe, expect, it } from 'vitest'
import { decodeLogsToRows, type DecodeContext } from './decode'

type TestLog = {
  eventName?: string
  address: `0x${string}`
  blockHash: `0x${string}`
  blockNumber: bigint | null
  data: `0x${string}`
  logIndex: number | null
  transactionHash: string | null
  transactionIndex: number
  removed: boolean
  args?: Record<string, unknown> | readonly unknown[]
}

const ctx: DecodeContext = {
  chain: 'MAINNET' as DecodeContext['chain'],
  poolAddress: '0xPOOL',
  protocolVersion: 3,
  blockTimestamps: new Map([
    [1n, 1000],
    [2n, 2000],
  ]),
}

function log(overrides: Partial<TestLog> = {}): TestLog {
  return {
    eventName: 'SwapFeePercentageChanged',
    address: '0xpool',
    blockHash: '0xhash',
    blockNumber: 1n,
    data: '0x',
    logIndex: 0,
    transactionHash: '0xabc',
    transactionIndex: 0,
    removed: false,
    args: { swapFeePercentage: 1000000000000000000n },
    ...overrides,
  }
}

// `decodeLogsToRows` types its input as the full viem `Log` (non-nullable
// blockNumber/logIndex/txHash), but the function itself guards against nulls
// at runtime. Our fixtures intentionally exercise those null paths, so cast
// through the looser `TestLog` shape.
function decode(...logs: TestLog[]) {
  return decodeLogsToRows(logs as never, ctx)
}

describe('decodeLogsToRows', () => {
  it('decodes a log into a row with JSON-safe args', () => {
    const rows = decode(log())
    expect(rows).toHaveLength(1)
    const row = rows[0]!
    expect(row.chain).toBe('MAINNET')
    expect(row.poolAddress).toBe('0xpool') // lowercased
    expect(row.protocolVersion).toBe(3)
    expect(row.blockNumber).toBe(1)
    expect(row.blockTimestamp).toBe(1000)
    expect(row.logIndex).toBe(0)
    expect(row.txHash).toBe('0xabc')
    expect(row.eventName).toBe('SwapFeePercentageChanged')
    // BigInt serialized to decimal string
    expect(row.args.swapFeePercentage).toBe('1000000000000000000')
  })

  it('skips logs without an eventName', () => {
    const rows = decode(log({ eventName: undefined }))
    expect(rows).toHaveLength(0)
  })

  it('skips logs with null blockNumber/logIndex/transactionHash', () => {
    expect(decode(log({ blockNumber: null }))).toHaveLength(0)
    expect(decode(log({ logIndex: null }))).toHaveLength(0)
    expect(decode(log({ transactionHash: null }))).toHaveLength(0)
  })

  it('skips logs whose block timestamp is unresolved', () => {
    const rows = decode(log({ blockNumber: 99n }))
    expect(rows).toHaveLength(0)
  })

  it('drops the indexed pool echo from args', () => {
    const rows = decode(log({ args: { pool: '0xpool', swapFeePercentage: 100n } }))
    expect(rows[0]!.args.pool).toBeUndefined()
    expect(rows[0]!.args.swapFeePercentage).toBe('100')
  })

  it('serializes nested arrays and objects', () => {
    const rows = decode(
      log({
        args: {
          amounts: [1n, 2n],
          nested: { a: 3n, b: 'x' },
        },
      })
    )

    expect(rows[0]!.args.amounts).toEqual(['1', '2'])
    expect(rows[0]!.args.nested).toEqual({ a: '3', b: 'x' })
  })

  it('handles positional (array) args by keying arg0, arg1...', () => {
    const rows = decode(log({ args: [10n, 'y'] }))
    expect(rows[0]!.args.arg0).toBe('10')
    expect(rows[0]!.args.arg1).toBe('y')
  })
})
