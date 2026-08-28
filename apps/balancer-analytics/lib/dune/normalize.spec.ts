import { describe, expect, it } from 'vitest'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { duneChainToGqlChain, nameToCategory, nameToSourceId, normalizeDuneRow } from './normalize'

describe('duneChainToGqlChain', () => {
  it('maps known Dune blockchain strings to GqlChain', () => {
    expect(duneChainToGqlChain('ethereum')).toBe(GqlChainValues.Mainnet)
    expect(duneChainToGqlChain('arbitrum')).toBe(GqlChainValues.Arbitrum)
    expect(duneChainToGqlChain('base')).toBe(GqlChainValues.Base)
    expect(duneChainToGqlChain('optimism')).toBe(GqlChainValues.Optimism)
    expect(duneChainToGqlChain('polygon')).toBe(GqlChainValues.Polygon)
    expect(duneChainToGqlChain('gnosis')).toBe(GqlChainValues.Gnosis)
    expect(duneChainToGqlChain('avalanche_c')).toBe(GqlChainValues.Avalanche)
    expect(duneChainToGqlChain('avalanche')).toBe(GqlChainValues.Avalanche)
    expect(duneChainToGqlChain('monad')).toBe(GqlChainValues.Monad)
    expect(duneChainToGqlChain('fantom')).toBe(GqlChainValues.Fantom)
    expect(duneChainToGqlChain('sonic')).toBe(GqlChainValues.Sonic)
  })

  it('is case-insensitive', () => {
    expect(duneChainToGqlChain('Ethereum')).toBe(GqlChainValues.Mainnet)
    expect(duneChainToGqlChain('ARBITRUM')).toBe(GqlChainValues.Arbitrum)
  })

  it('returns null for unknown chains', () => {
    expect(duneChainToGqlChain('solana')).toBeNull()
    expect(duneChainToGqlChain('')).toBeNull()
  })
})

describe('nameToSourceId', () => {
  it('collapses known brands onto their canonical id', () => {
    expect(nameToSourceId('1Inch')).toBe('1inch')
    expect(nameToSourceId('Paraswap')).toBe('paraswap')
    expect(nameToSourceId('Uniswap X')).toBe('uniswap-x')
    expect(nameToSourceId('Uniswap V3')).toBe('uniswap-v3')
    expect(nameToSourceId('Uniswap v2')).toBe('uniswap-v2')
    expect(nameToSourceId('Matcha')).toBe('0x')
    expect(nameToSourceId('TraderJoe')).toBe('lfj')
    expect(nameToSourceId('LFJ')).toBe('lfj')
  })

  it('slugifies unknown names', () => {
    expect(nameToSourceId('Some Random Router')).toBe('some-random-router')
    expect(nameToSourceId('  padded  ')).toBe('padded')
  })

  it('falls back to "unknown" for an empty slug', () => {
    expect(nameToSourceId('!!!')).toBe('unknown')
  })
})

describe('nameToCategory', () => {
  it('classifies MEV bots before generic routes', () => {
    expect(nameToCategory('MEV Bot')).toBe('mev_bot')
    expect(nameToCategory('Arbitrage Bot')).toBe('mev_bot')
    expect(nameToCategory('Searcher')).toBe('mev_bot')
    expect(nameToCategory('Jared')).toBe('mev_bot')
  })

  it('classifies bridges', () => {
    expect(nameToCategory('LayerZero')).toBe('bridge')
    expect(nameToCategory('Stargate')).toBe('bridge')
    expect(nameToCategory('Across')).toBe('bridge')
    expect(nameToCategory('Wormhole')).toBe('bridge')
  })

  it('classifies intent venues', () => {
    expect(nameToCategory('CowSwap')).toBe('intent')
    expect(nameToCategory('Uniswap X')).toBe('intent')
    expect(nameToCategory('Bebop')).toBe('intent')
  })

  it('classifies market makers', () => {
    expect(nameToCategory('Wintermute')).toBe('market_maker')
    expect(nameToCategory('Jane Street')).toBe('market_maker')
    expect(nameToCategory('SomeMM')).toBe('market_maker')
  })

  it('classifies Balancer routers as direct', () => {
    expect(nameToCategory('Balancer Vault')).toBe('direct')
    expect(nameToCategory('balancer router')).toBe('direct')
  })

  it('defaults to aggregator', () => {
    expect(nameToCategory('Some DEX Router')).toBe('aggregator')
  })
})

describe('normalizeDuneRow', () => {
  const valid = {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    name: '1Inch',
    blockchain: 'ethereum',
  }

  it('normalizes a valid row', () => {
    const row = normalizeDuneRow(valid)
    expect(row).not.toBeNull()
    expect(row!.chain).toBe(GqlChainValues.Mainnet)
    expect(row!.address).toBe(valid.address)
    expect(row!.sourceId).toBe('1inch')
    expect(row!.category).toBe('aggregator')
  })

  it('lowercases the address', () => {
    const row = normalizeDuneRow({ ...valid, address: valid.address.toUpperCase() })
    expect(row!.address).toBe(valid.address)
  })

  it('returns null for non-string fields', () => {
    expect(normalizeDuneRow({ address: 123, name: 'x', blockchain: 'ethereum' })).toBeNull()

    expect(
      normalizeDuneRow({ address: valid.address, name: null, blockchain: 'ethereum' })
    ).toBeNull()

    expect(
      normalizeDuneRow({ address: valid.address, name: 'x', blockchain: undefined })
    ).toBeNull()
  })

  it('returns null for unsupported chains', () => {
    expect(normalizeDuneRow({ ...valid, blockchain: 'solana' })).toBeNull()
  })

  it('returns null for malformed addresses', () => {
    expect(normalizeDuneRow({ ...valid, address: '0x123' })).toBeNull()
    expect(normalizeDuneRow({ ...valid, address: 'not-an-address' })).toBeNull()
  })
})
