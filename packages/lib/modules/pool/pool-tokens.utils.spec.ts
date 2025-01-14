import { morphoStakeHouse, sDAIBoosted } from './__mocks__/pool-examples/boosted'
import {
  balWeth8020,
  osETHPhantom,
  sDAIWeighted,
  v2SepoliaStableWithERC4626,
} from './__mocks__/pool-examples/flat'
import { auraBal, staBALv2Nested } from './__mocks__/pool-examples/nested'
import {
  tokenSymbols,
  underlyingTokenSymbols,
} from './__mocks__/pool-examples/pool-example-helpers'
import { PoolExample } from './__mocks__/pool-examples/pool-examples.types'
import {
  getCompositionTokens,
  getUserReferenceTokens,
  getFlatUserReferenceTokens,
} from './pool-tokens.utils'
import { ApiToken } from '../tokens/token.types'
import { PoolToken } from './pool.types'
import { getApiPoolMock } from './__mocks__/api-mocks/api-mocks'

// Testing utils that can be kept in the test:
function getCompositionTokenSymbols(poolExample: PoolExample): string[] {
  const pool = getApiPoolMock(poolExample)

  return tokenSymbols(getCompositionTokens(pool))
}

function getCompositionTokensFromPoolExample(poolExample: PoolExample): PoolToken[] {
  const pool = getApiPoolMock(poolExample)
  return getCompositionTokens(pool)
}

function getUserReferenceTokenSymbols(poolExample: PoolExample): string[] {
  const pool = getApiPoolMock(poolExample)

  return tokenSymbols(getUserReferenceTokens(pool))
}

function getBoostedUnderlyingTokenSymbols(poolExample: PoolExample): string[] {
  const displayTokens = getCompositionTokensFromPoolExample(poolExample)

  return underlyingTokenSymbols(displayTokens)
}

function getFlatUserReferenceTokenSymbols(poolExample: PoolExample): string[] {
  const pool = getApiPoolMock(poolExample)

  return tokenSymbols(getFlatUserReferenceTokens(pool) as ApiToken[])
}

function getUserReferenceTokensWeights(poolExample: PoolExample): (string | undefined)[] {
  const pool = getApiPoolMock(poolExample)

  return getUserReferenceTokens(pool).map(t => t.weight)
}

function getUserReferenceTokensURIs(poolExample: PoolExample): (string | null | undefined)[] {
  const pool = getApiPoolMock(poolExample)

  return getUserReferenceTokens(pool).map(t => t.logoURI)
}

function getCompositionTokensWeights(poolExample: PoolExample): (string | undefined)[] {
  const pool = getApiPoolMock(poolExample)

  return getCompositionTokens(pool).map(t => t.weight)
}

function getCompositionTokensURIs(poolExample: PoolExample): (string | null | undefined)[] {
  const pool = getApiPoolMock(poolExample)

  return getCompositionTokens(pool).map(t => t.logoURI)
}

describe('getDisplayTokens for flat pools', () => {
  it('BAL WETH 80 20', () => {
    expect(getCompositionTokenSymbols(balWeth8020)).toEqual(['BAL', 'WETH'])

    expect(getUserReferenceTokenSymbols(balWeth8020)).toEqual(['BAL', 'WETH'])

    expect(getUserReferenceTokensWeights(balWeth8020)).toEqual(['0.8', '0.2'])
    expect(getCompositionTokensWeights(balWeth8020)).toEqual(['0.8', '0.2'])

    expect(getUserReferenceTokensURIs(balWeth8020)).toMatchInlineSnapshot(`
      [
        "https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xba100000625a3754423978a60c9317c58a424e3d.png",
        "https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
      ]
    `)

    expect(getCompositionTokensURIs(balWeth8020)).toMatchInlineSnapshot(`
      [
        "https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xba100000625a3754423978a60c9317c58a424e3d.png",
        "https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
      ]
    `)

    expect(getFlatUserReferenceTokenSymbols(balWeth8020)).toEqual(['BAL', 'WETH'])
  })

  it('osETH Phantom Composable Stable', () => {
    expect(getCompositionTokenSymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])

    expect(getUserReferenceTokenSymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])

    expect(getFlatUserReferenceTokenSymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])
  })

  it('sDAI weighted', () => {
    expect(getCompositionTokenSymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])

    expect(getUserReferenceTokenSymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])

    expect(getFlatUserReferenceTokenSymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])
  })

  it('v2 stable with ERC4626 tokens (V2 so no boosted)', () => {
    expect(getCompositionTokenSymbols(v2SepoliaStableWithERC4626)).toEqual([
      'dai-aave',
      'usdc-aave',
    ])
    expect(getUserReferenceTokenSymbols(v2SepoliaStableWithERC4626)).toEqual([
      'dai-aave',
      'usdc-aave',
    ])

    expect(getFlatUserReferenceTokenSymbols(v2SepoliaStableWithERC4626)).toEqual([
      'dai-aave',
      'usdc-aave',
    ])
  })
})

describe('getDisplayTokens for NESTED pools', () => {
  it('v2 nested', () => {
    expect(getCompositionTokenSymbols(staBALv2Nested)).toEqual(['WBTC', 'WETH', 'staBAL3'])

    expect(getUserReferenceTokenSymbols(staBALv2Nested)).toEqual(['WBTC', 'WETH', 'staBAL3'])

    expect(getFlatUserReferenceTokenSymbols(staBALv2Nested)).toEqual([
      'USDC',
      'USDT',
      'WBTC',
      'WETH',
      'WXDAI',
      'staBAL3',
    ])
  })

  it('aura bal (Nested with supportsNestedActions false)', () => {
    expect(getCompositionTokenSymbols(auraBal)).toEqual(['B-80BAL-20WETH', 'auraBAL'])

    expect(getUserReferenceTokenSymbols(auraBal)).toEqual(['B-80BAL-20WETH', 'auraBAL'])

    expect(getFlatUserReferenceTokenSymbols(auraBal)).toEqual(['BAL', 'WETH', 'auraBAL'])
  })

  it('aura bal (Nested with supportsNestedActions false)', () => {
    expect(getCompositionTokenSymbols(auraBal)).toEqual(['B-80BAL-20WETH', 'auraBAL'])

    expect(getUserReferenceTokenSymbols(auraBal)).toEqual(['B-80BAL-20WETH', 'auraBAL'])

    expect(getFlatUserReferenceTokenSymbols(auraBal)).toEqual(['BAL', 'WETH', 'auraBAL'])
  })
})

describe('getDisplayTokens for BOOSTED pools', () => {
  it('Morpho boosted', () => {
    expect(getCompositionTokenSymbols(morphoStakeHouse)).toEqual(['csUSDL', 'steakUSDC'])

    expect(getUserReferenceTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(getBoostedUnderlyingTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(getFlatUserReferenceTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])
  })

  it('sDAI boosted', () => {
    expect(getCompositionTokenSymbols(sDAIBoosted)).toEqual(['sDAI', 'waGnoGNO'])

    expect(getUserReferenceTokenSymbols(sDAIBoosted)).toEqual(['GNO', 'sDAI'])

    expect(getFlatUserReferenceTokenSymbols(sDAIBoosted)).toEqual(['GNO', 'sDAI'])
  })
})
