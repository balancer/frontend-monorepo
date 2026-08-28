import { describe, expect, it } from 'vitest'
import { stripFeeRebates } from './cow-rebate'
import type { PoolParamEventRow } from '@analytics/lib/db'

function feeRow(
  overrides: Partial<PoolParamEventRow> & { blockNumber: number; logIndex: number; txHash: string }
): PoolParamEventRow {
  return {
    chain: 'MAINNET' as PoolParamEventRow['chain'],
    poolAddress: '0xpool',
    protocolVersion: 2,
    blockTimestamp: 0,
    eventName: 'SwapFeePercentageChanged',
    args: { swapFeePercentage: '100000000000000000' },
    ...overrides,
  }
}

function nonFeeRow(
  overrides: Partial<PoolParamEventRow> & { blockNumber: number; logIndex: number; txHash: string }
): PoolParamEventRow {
  return {
    chain: 'MAINNET' as PoolParamEventRow['chain'],
    poolAddress: '0xpool',
    protocolVersion: 2,
    blockTimestamp: 0,
    eventName: 'PausedStateChanged',
    args: { paused: true },
    ...overrides,
  }
}

describe('stripFeeRebates', () => {
  it('drops a lower-then-restore pair in the same tx (round-trip)', () => {
    const rows = [
      feeRow({ blockNumber: 1, logIndex: 0, txHash: '0xa', args: { swapFeePercentage: '100' } }),
      feeRow({ blockNumber: 1, logIndex: 1, txHash: '0xa', args: { swapFeePercentage: '50' } }),
      feeRow({ blockNumber: 1, logIndex: 2, txHash: '0xa', args: { swapFeePercentage: '100' } }),
    ]

    const { rows: out, stripped } = stripFeeRebates(rows)
    expect(stripped).toBe(3)
    expect(out).toHaveLength(0)
  })

  it('keeps a genuine single fee move', () => {
    const rows = [
      feeRow({ blockNumber: 1, logIndex: 0, txHash: '0xa', args: { swapFeePercentage: '100' } }),
    ]

    const { rows: out, stripped } = stripFeeRebates(rows)
    expect(stripped).toBe(0)
    expect(out).toHaveLength(1)
    expect(out[0].args.swapFeePercentage).toBe('100')
  })

  it('collapses a multi-step genuine move to its final write', () => {
    // Establish a running fee with a single move first, then a multi-step
    // group that ends at a different value — a genuine move, not a rebate.
    const rows = [
      feeRow({ blockNumber: 1, logIndex: 0, txHash: '0xa', args: { swapFeePercentage: '100' } }),
      feeRow({ blockNumber: 2, logIndex: 0, txHash: '0xb', args: { swapFeePercentage: '80' } }),
      feeRow({ blockNumber: 2, logIndex: 1, txHash: '0xb', args: { swapFeePercentage: '60' } }),
    ]

    const { rows: out, stripped } = stripFeeRebates(rows)
    expect(stripped).toBe(1)
    expect(out).toHaveLength(2)
    expect(out[0].args.swapFeePercentage).toBe('100')
    expect(out[1].args.swapFeePercentage).toBe('60')
  })

  it('treats a ≥2 group at window start as a rebate (running fee unknown)', () => {
    const rows = [
      feeRow({ blockNumber: 1, logIndex: 0, txHash: '0xa', args: { swapFeePercentage: '50' } }),
      feeRow({ blockNumber: 1, logIndex: 1, txHash: '0xa', args: { swapFeePercentage: '100' } }),
    ]

    const { rows: out, stripped } = stripFeeRebates(rows)
    expect(stripped).toBe(2)
    expect(out).toHaveLength(0)
  })

  it('keeps a genuine move that does not return to the running fee', () => {
    const rows = [
      feeRow({ blockNumber: 1, logIndex: 0, txHash: '0xa', args: { swapFeePercentage: '100' } }),
      feeRow({ blockNumber: 2, logIndex: 0, txHash: '0xb', args: { swapFeePercentage: '50' } }),
      feeRow({ blockNumber: 2, logIndex: 1, txHash: '0xb', args: { swapFeePercentage: '80' } }),
    ]

    const { rows: out, stripped } = stripFeeRebates(rows)
    // First tx: single move, kept. Second tx: 50 → 80, final != running (100), kept as 80.
    expect(stripped).toBe(1)
    expect(out).toHaveLength(2)
    expect(out[0].args.swapFeePercentage).toBe('100')
    expect(out[1].args.swapFeePercentage).toBe('80')
  })

  it('passes non-fee events through untouched', () => {
    const rows = [
      nonFeeRow({ blockNumber: 1, logIndex: 0, txHash: '0xa' }),
      feeRow({ blockNumber: 1, logIndex: 1, txHash: '0xa', args: { swapFeePercentage: '100' } }),
      nonFeeRow({ blockNumber: 1, logIndex: 2, txHash: '0xa' }),
    ]

    const { rows: out, stripped } = stripFeeRebates(rows)
    expect(stripped).toBe(0)
    expect(out).toHaveLength(3)
  })

  it('sorts unsorted input chronologically before processing', () => {
    const rows = [
      feeRow({ blockNumber: 2, logIndex: 0, txHash: '0xb', args: { swapFeePercentage: '50' } }),
      feeRow({ blockNumber: 1, logIndex: 0, txHash: '0xa', args: { swapFeePercentage: '100' } }),
    ]

    const { rows: out } = stripFeeRebates(rows)
    expect(out.map(r => r.blockNumber)).toEqual([1, 2])
  })
})
