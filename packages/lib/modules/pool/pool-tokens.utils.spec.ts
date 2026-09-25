import {
  boostedCoinshiftUsdcUsdl,
  morphoStakeHouse,
  usdcUsdtAaveBoosted,
  anSSiloWSBoosted,
} from './__mocks__/pool-examples/boosted'
import {
  osETHPhantom,
  sDAIWeighted,
  v2SepoliaStableWithERC4626,
  scUsdStS,
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
  getBoostedActionableTokens,
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
  it('Sonic v2 weighted scUSD/stS', () => {
    expect(getCompositionTokenSymbols(scUsdStS)).toEqual(['scUSD', 'stS'])
    expect(getUserReferenceTokenSymbols(scUsdStS)).toEqual(['scUSD', 'stS'])
    expect(getUserReferenceTokensWeights(scUsdStS)).toEqual(['0.3', '0.7'])
    expect(getCompositionTokensWeights(scUsdStS)).toEqual(['0.3', '0.7'])
    expect(getUserReferenceTokensURIs(scUsdStS)).toEqual(getCompositionTokensURIs(scUsdStS))

    expect(getUserReferenceTokensURIs(scUsdStS)).toEqual([
      'https://i.ibb.co/PFw2zkx/scUSD64.png',
      'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xe5da20f15420ad15de0fa650600afc998bbe3955.png',
    ])

    expect(getFlatUserReferenceTokenSymbols(scUsdStS)).toEqual(['scUSD', 'stS'])
    expect(getPoolActionableTokenSymbols(scUsdStS)).toEqual(['scUSD', 'stS'])
  })

  // TODO: Add a Beets/Sonic v2 phantom composable-stable pool fixture.
  it.skip('osETH Phantom Composable Stable', () => {
    expect(getCompositionTokenSymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])

    expect(getUserReferenceTokenSymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])

    expect(getFlatUserReferenceTokenSymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])

    expect(getPoolActionableTokenSymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])
  })

  // TODO: Add a Beets/Sonic weighted pool with a non-boosted ERC4626 token.
  it.skip('sDAI weighted', () => {
    expect(getCompositionTokenSymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])

    expect(getUserReferenceTokenSymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])

    expect(getFlatUserReferenceTokenSymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])

    expect(getPoolActionableTokenSymbols(sDAIWeighted)).toEqual(['wstETH', 'sDAI'])
  })

  // TODO: Add a Beets/Sonic v2 stable pool with ERC4626 tokens.
  it.skip('v2 stable with ERC4626 tokens (V2 so no boosted)', () => {
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

// TODO: Remove these Balancer-only nested pool cases when Sonic nested pool support is dropped.
describe.skip('getDisplayTokens for NESTED pools', () => {
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
  // TODO: Add a Beets/Sonic fully boosted pool with two ERC4626 tokens.
  it.skip('Morpho boosted', () => {
    expect(getCompositionTokenSymbols(morphoStakeHouse)).toEqual(['csUSDL', 'steakUSDC'])

    expect(getUserReferenceTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(getBoostedUnderlyingTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(getFlatUserReferenceTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(getPoolActionableTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(getWrappedBoostedTokenSymbols(morphoStakeHouse)).toEqual(['steakUSDC', 'csUSDL'])
  })

  it('Sonic partial boosted', () => {
    expect(getCompositionTokenSymbols(anSSiloWSBoosted)).toEqual(['SiloWS', 'anS'])
    expect(getUserReferenceTokenSymbols(anSSiloWSBoosted)).toEqual(['anS', 'wS'])
    expect(getFlatUserReferenceTokenSymbols(anSSiloWSBoosted)).toEqual(['anS', 'wS'])
    expect(getPoolActionableTokenSymbols(anSSiloWSBoosted)).toEqual(['wS', 'anS'])
    expect(getWrappedBoostedTokenSymbols(anSSiloWSBoosted)).toEqual(['SiloWS'])
  })
})

describe('Sonic partial boosted actionable tokens', () => {
  it('uses the underlying token when wrapping is enabled', () => {
    expect(getPoolActionableTokenSymbols(anSSiloWSBoosted, [true, true])).toEqual(['wS', 'anS'])
    expect(getPoolActionableTokenSymbols(anSSiloWSBoosted, [true, false])).toEqual(['wS', 'anS'])
  })

  it('uses SiloWS when wrapping is disabled', () => {
    expect(getPoolActionableTokenSymbols(anSSiloWSBoosted, [false, false])).toEqual([
      'SiloWS',
      'anS',
    ])

    expect(getPoolActionableTokenSymbols(anSSiloWSBoosted, [false, true])).toEqual([
      'SiloWS',
      'anS',
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

// TODO: Add a Beets/Sonic fully boosted pool with two ERC4626 tokens.
describe.skip('Given a fully boosted pool', () => {
  const pool = getApiPoolMock(usdcUsdtAaveBoosted)

  const balanceForMock: BalanceForFn = (token: TokenBase | string) => {
    if (typeof token === 'string') return aTokenAmount(token)
    return aTokenAmount(token)
  }

  it('underlying tokens are used as actionable by default', () => {
    const tokens = getPoolActionableTokens(pool)

    const firstUnderlyingToken = requiredAt(tokens, 0)
    const firstWrappedToken = firstUnderlyingToken.wrappedToken

    expect(firstUnderlyingToken.symbol).toEqual('USDT')
    expect(firstUnderlyingToken.wrappedToken?.symbol).toEqual('waEthUSDT')
    expect(shouldUseUnderlyingToken(firstUnderlyingToken, pool)).toBe(false)

    if (!firstWrappedToken) throw new Error('No wrapped token')

    expect(firstWrappedToken.symbol).toEqual('waEthUSDT')
    expect(firstWrappedToken.wrappedToken).toBeUndefined()
    expect(shouldUseUnderlyingToken(firstWrappedToken, pool)).toBe(true)

    const secondUnderlyingToken = requiredAt(tokens, 1)
    const secondWrappedToken = secondUnderlyingToken.wrappedToken

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
    const firstUnderlyingToken = requiredAt(tokens, 0)

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
    const firstUnderlyingToken = requiredAt(tokens, 0)

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

  it(`when useWrappedForAddRemove is not true in the wrapped token
    getWrappedAndUnderlyingTokenFn should return an empty function to avoid the wrapped/underlying selector the UI`, () => {
    const tokens = getPoolActionableTokens(pool)
    const firstUnderlyingToken = requiredAt(tokens, 0)

    // Set useWrappedForAddRemove to false as we don't have a real pool example with in this scenario yet
    if (firstUnderlyingToken.wrappedToken?.useWrappedForAddRemove) {
      firstUnderlyingToken.wrappedToken.useWrappedForAddRemove = false
    }

    const pair = getWrappedAndUnderlyingTokenFn(firstUnderlyingToken, pool, balanceForMock)?.()

    expect(pair).toBeUndefined()
  })
})

// TODO: Add a Beets/Sonic fully boosted pool with two ERC4626 tokens.
it.skip('getActionableTokenAddresses', () => {
  const pool = getApiPoolMock(usdcUsdtAaveBoosted)
  expect(getActionableTokenAddresses(pool)).toEqual([usdtAddress, usdcAddress])
  expect(getActionableTokenAddresses(pool, [true, true])).toEqual([usdtAddress, usdcAddress])
  expect(getActionableTokenAddresses(pool, [false, false])).toEqual([waUsdtAddress, waUsdcAddress])
  expect(getActionableTokenAddresses(pool, [false, true])).toEqual([waUsdtAddress, usdcAddress])
})

// TODO: Add a Beets/Sonic fully boosted pool with two ERC4626 tokens.
describe.skip('getBoostedActionableTokens', () => {
  it('with two boosted tokens', () => {
    const pool = getApiPoolMock(boostedCoinshiftUsdcUsdl)

    const boostedTokens = getBoostedActionableTokens(pool)

    const firstUnderlyingToken = requiredAt(boostedTokens, 0)
    expect(firstUnderlyingToken.symbol).toBe('USDC')
    expect(firstUnderlyingToken.underlyingToken).toBeUndefined()

    const firstWrappedToken = firstUnderlyingToken.wrappedToken
    expect(firstWrappedToken?.symbol).toBe('csUSDC')
    expect(firstWrappedToken?.underlyingToken?.symbol).toBe('USDC')

    const secondUnderlyingToken = requiredAt(boostedTokens, 1)
    expect(secondUnderlyingToken.symbol).toBe('wUSDL')
    expect(secondUnderlyingToken.underlyingToken).toBeUndefined()

    const secondWrappedToken = secondUnderlyingToken.wrappedToken
    expect(secondWrappedToken?.symbol).toBe('csUSDL')
    expect(secondWrappedToken?.underlyingToken?.symbol).toBe('wUSDL')
  })
})

function requiredAt<T>(items: readonly T[], index: number): T {
  const item = items[index]
  if (!item) throw new Error(`Missing item at index ${index}`)
  return item
}
