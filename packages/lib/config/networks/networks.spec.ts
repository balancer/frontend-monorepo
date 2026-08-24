import { describe, expect, it } from 'vitest'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getNetworkConfig } from './index'

describe('getNetworkConfig', () => {
  it('resolves a config for every supported chain', () => {
    const chains = Object.values(GqlChainValues) as GqlChain[]

    for (const chain of chains) {
      const config = getNetworkConfig(chain)
      expect(config.chain).toBe(chain)
      expect(config.chainId).toBeTypeOf('number')
      expect(config.name).toBeTypeOf('string')
      expect(config.shortName).toBeTypeOf('string')
      expect(config.blockExplorer.baseUrl).toMatch(/^https:\/\//)
    }
  })

  it('throws for unknown chains', () => {
    expect(() => getNetworkConfig('UNKNOWN' as GqlChain)).toThrow(
      /Missing network config for chain UNKNOWN/
    )
  })
})
