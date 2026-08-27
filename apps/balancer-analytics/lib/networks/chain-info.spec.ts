import { describe, expect, it } from 'vitest'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { blocksPerSecond, secondsPerBlock } from './chain-info'

describe('secondsPerBlock', () => {
  it('returns the configured value per chain', () => {
    expect(secondsPerBlock(GqlChainValues.Mainnet)).toBe(12)
    expect(secondsPerBlock(GqlChainValues.Arbitrum)).toBe(0.26)
    expect(secondsPerBlock(GqlChainValues.Base)).toBe(2)
  })

  it('falls back to 12s for unknown chains', () => {
    expect(secondsPerBlock('UNKNOWN' as GqlChain)).toBe(12)
  })
})

describe('blocksPerSecond', () => {
  it('is the inverse of secondsPerBlock', () => {
    expect(blocksPerSecond(GqlChainValues.Mainnet)).toBeCloseTo(1 / 12)
    expect(blocksPerSecond(GqlChainValues.Arbitrum)).toBeCloseTo(1 / 0.26)
  })
})
