import {
  morphoStakeHouse,
  partialBoosted,
  usdcUsdtAaveBoosted,
} from './__mocks__/pool-examples/boosted'
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
  getNestedPoolTokens,
  getWrappedBoostedTokens,
  shouldUseUnderlyingToken,
  getPoolActionableTokens,
  getWrappedAndUnderlyingTokenFn,
  getActionableTokenAddresses,
} from './pool-tokens.utils'
import { ApiToken, BalanceForFn, TokenAmount, TokenBase } from '../tokens/token.types'
import { PoolToken } from './pool.types'
import { getApiPoolMock } from './__mocks__/api-mocks/api-mocks'
import { usdcAddress, usdtAddress, waUsdcAddress, waUsdtAddress } from '@repo/lib/debug-helpers'

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

function getPoolActionableTokenSymbols(
  poolExample: PoolExample,
  wrapUnderlying?: boolean[]
): string[] {
  const pool = getApiPoolMock(poolExample)

  return getPoolActionableTokens(pool, wrapUnderlying).map(t => t.symbol)
}

function getWrappedBoostedTokenSymbols(poolExample: PoolExample): string[] {
  const pool = getApiPoolMock(poolExample)

  return getWrappedBoostedTokens(pool).map(t => t.symbol)
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

    expect(getPoolActionableTokenSymbols(balWeth8020)).toEqual(['BAL', 'WETH'])
  })

  it('osETH Phantom Composable Stable', () => {
    expect(getCompositionTokenSymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])

    expect(getUserReferenceTokenSymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])

    expect(getFlatUserReferenceTokenSymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])

    expect(getPoolActionableTokenSymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])
  })

  it('sDAI weighted', () => {
    expect(getCompositionTokenSymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])

    expect(getUserReferenceTokenSymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])

    expect(getFlatUserReferenceTokenSymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])

    expect(getPoolActionableTokenSymbols(sDAIWeighted)).toEqual(['wstETH', 'sDAI'])
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

    expect(getPoolActionableTokenSymbols(v2SepoliaStableWithERC4626)).toEqual([
      'usdc-aave',
      'dai-aave',
    ])

    expect(getWrappedBoostedTokenSymbols(v2SepoliaStableWithERC4626)).toEqual([])
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
    ])

    expect(getPoolActionableTokenSymbols(staBALv2Nested)).toEqual([
      'USDT',
      'USDC',
      'WXDAI',
      'WETH',
      'WBTC',
    ])

    const pool = getApiPoolMock(staBALv2Nested)
    const staBalBPT = pool.poolTokens.find(t => t.hasNestedPool)
    expect(getNestedPoolTokens(staBalBPT as PoolToken).map(t => t.symbol)).toMatchInlineSnapshot(`
      [
        "USDT",
        "USDC",
        "WXDAI",
      ]
    `)
  })

  it('aura bal (Nested with supportsNestedActions false)', () => {
    expect(getCompositionTokenSymbols(auraBal)).toEqual(['B-80BAL-20WETH', 'auraBAL'])

    expect(getUserReferenceTokenSymbols(auraBal)).toEqual(['B-80BAL-20WETH', 'auraBAL'])

    expect(getFlatUserReferenceTokenSymbols(auraBal)).toEqual(['BAL', 'WETH', 'auraBAL'])

    expect(getPoolActionableTokenSymbols(auraBal)).toEqual(['B-80BAL-20WETH', 'auraBAL'])
  })
})

describe('getDisplayTokens for BOOSTED pools', () => {
  it('Morpho boosted', () => {
    expect(getCompositionTokenSymbols(morphoStakeHouse)).toEqual(['csUSDL', 'steakUSDC'])

    expect(getUserReferenceTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(getBoostedUnderlyingTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(getFlatUserReferenceTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(getPoolActionableTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(getWrappedBoostedTokenSymbols(morphoStakeHouse)).toEqual(['steakUSDC', 'csUSDL'])
  })

  it('partial boosted', () => {
    expect(getCompositionTokenSymbols(partialBoosted)).toEqual(['sDAI', 'waGnoGNO'])

    expect(getUserReferenceTokenSymbols(partialBoosted)).toEqual(['GNO', 'sDAI'])

    expect(getFlatUserReferenceTokenSymbols(partialBoosted)).toEqual(['GNO', 'sDAI'])

    expect(getPoolActionableTokenSymbols(partialBoosted)).toEqual(['GNO', 'sDAI'])

    expect(getWrappedBoostedTokenSymbols(partialBoosted)).toEqual(['waGnoGNO'])
  })
})

describe('Partial boosted pool: returns getPoolActionableTokens based on wrapUnderlying array when', () => {
  it('first token must be wrapped (second is not boosted)', () => {
    expect(getPoolActionableTokenSymbols(partialBoosted, [true, true])).toEqual(['GNO', 'sDAI'])
    expect(getPoolActionableTokenSymbols(partialBoosted, [true, false])).toEqual(['GNO', 'sDAI'])
  })

  it('second token must not be wrapped (second is not boosted)', () => {
    expect(getPoolActionableTokenSymbols(partialBoosted, [false, false])).toEqual([
      'waGnoGNO',
      'sDAI',
    ])
    expect(getPoolActionableTokenSymbols(partialBoosted, [false, true])).toEqual([
      'waGnoGNO',
      'sDAI',
    ])
  })
})

function aTokenAmount(token: TokenBase | string, amount = 0n): TokenAmount {
  const address = typeof token === 'string' ? token : token.address

  return {
    address,
    chainId: 1,
    decimals: 18,
    amount,
    formatted: '100',
  }
}

describe('Given a fully boosted pool', () => {
  const pool = getApiPoolMock(usdcUsdtAaveBoosted)

  const balanceForMock: BalanceForFn = (token: TokenBase | string) => {
    if (typeof token === 'string') return aTokenAmount(token)
    return aTokenAmount(token)
  }

  it('underlying tokens are used as actionable by default', () => {
    const tokens = getPoolActionableTokens(pool)

    const firstUnderlyingToken = tokens[0]
    const firstWrappedToken = tokens[0].wrappedToken

    expect(firstUnderlyingToken.symbol).toEqual('USDT')
    expect(firstUnderlyingToken.wrappedToken?.symbol).toEqual('waEthUSDT')
    expect(shouldUseUnderlyingToken(firstUnderlyingToken, pool)).toBe(false)

    if (!firstWrappedToken) throw new Error('No wrapped token')

    expect(firstWrappedToken.symbol).toEqual('waEthUSDT')
    expect(firstWrappedToken.wrappedToken).toBeUndefined()
    expect(shouldUseUnderlyingToken(firstWrappedToken, pool)).toBe(true)

    const secondUnderlyingToken = tokens[1]
    const secondWrappedToken = tokens[1].wrappedToken

    expect(secondUnderlyingToken.symbol).toEqual('USDC')
    expect(secondUnderlyingToken.wrappedToken?.symbol).toEqual('waEthUSDC')
    expect(shouldUseUnderlyingToken(secondUnderlyingToken, pool)).toBe(false)

    if (!secondWrappedToken) throw new Error('No wrapped token')

    expect(secondWrappedToken.symbol).toEqual('waEthUSDC')
    expect(secondWrappedToken.wrappedToken).toBeUndefined()
    expect(shouldUseUnderlyingToken(secondWrappedToken, pool)).toBe(true)
  })

  it('wrapped/underlying pair is sorted with underlying first by default', () => {
    const tokens = getPoolActionableTokens(pool)
    const firstUnderlyingToken = tokens[0]

    const pair = getWrappedAndUnderlyingTokenFn(firstUnderlyingToken, pool, balanceForMock)?.()

    if (!pair) throw new Error('No pair')

    const first = pair[0]
    const second = pair[1]

    expect(first.symbol).toEqual('USDT')
    expect(first.wrappedToken).toEqual(second)
    expect(shouldUseUnderlyingToken(first, pool)).toEqual(false)

    expect(second.symbol).toEqual('waEthUSDT')
    expect(shouldUseUnderlyingToken(second, pool)).toEqual(true)
  })

  it('wrapped/underlying pair is sorted with wrapped first when wrapped balance > underlying balance', () => {
    const tokens = getPoolActionableTokens(pool)
    const firstUnderlyingToken = tokens[0]

    const balanceForMock: BalanceForFn = (token: TokenBase | string) => {
      if (typeof token === 'string') return aTokenAmount(token)

      if (token.symbol === 'waEthUSDT') return aTokenAmount(token, 3000n)
      if (token.symbol === 'USDT') return aTokenAmount(token, 10n)
      return aTokenAmount(token)
    }

    const pair = getWrappedAndUnderlyingTokenFn(firstUnderlyingToken, pool, balanceForMock)?.()

    if (!pair) throw new Error('No pair')

    const first = pair[0]
    const second = pair[1]

    expect(first.symbol).toEqual('waEthUSDT')
    expect(first.underlyingToken?.symbol).toEqual('USDT')
    expect(shouldUseUnderlyingToken(first, pool)).toEqual(true)

    expect(second.symbol).toEqual('USDT')
    expect(shouldUseUnderlyingToken(second, pool)).toEqual(false)
    expect(second.wrappedToken?.symbol).toEqual('waEthUSDT')
  })
})

it('getActionableTokenAddresses', () => {
  const pool = getApiPoolMock(usdcUsdtAaveBoosted)
  expect(getActionableTokenAddresses(pool)).toEqual([usdtAddress, usdcAddress])
  expect(getActionableTokenAddresses(pool, [true, true])).toEqual([usdtAddress, usdcAddress])
  expect(getActionableTokenAddresses(pool, [false, false])).toEqual([waUsdtAddress, waUsdcAddress])
  expect(getActionableTokenAddresses(pool, [false, true])).toEqual([waUsdtAddress, usdcAddress])
})
