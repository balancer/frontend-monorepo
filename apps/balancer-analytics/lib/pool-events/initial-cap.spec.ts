import { describe, expect, it } from 'vitest'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { ninetyDayFromBlock, thirtyDayFromBlock } from './initial-cap'

describe('ninetyDayFromBlock', () => {
  it('returns head minus the 90-day window in blocks', () => {
    // Mainnet: 12s/block → 90 days = 648000 blocks
    const from = ninetyDayFromBlock(GqlChainValues.Mainnet, 1_000_000n)
    expect(from).toBe(1_000_000n - 648_000n)
  })

  it('never goes below 0', () => {
    expect(ninetyDayFromBlock(GqlChainValues.Mainnet, 100n)).toBe(0n)
  })
})

describe('thirtyDayFromBlock', () => {
  it('returns head minus the 30-day window in blocks', () => {
    // Mainnet: 12s/block → 30 days = 216000 blocks
    const from = thirtyDayFromBlock(GqlChainValues.Mainnet, 1_000_000n)
    expect(from).toBe(1_000_000n - 216_000n)
  })

  it('never goes below 0', () => {
    expect(thirtyDayFromBlock(GqlChainValues.Mainnet, 100n)).toBe(0n)
  })
})
