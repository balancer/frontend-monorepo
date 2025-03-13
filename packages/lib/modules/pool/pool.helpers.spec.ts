/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-len */
import { Pool } from './pool.types'
import { getApiPoolMock } from './__mocks__/api-mocks/api-mocks'
import { v3SepoliaNestedBoostedMock } from './__mocks__/api-mocks/v3SepoliaNestedBoostedMock'
import { auraBal, staBALv2Nested } from './__mocks__/pool-examples/nested'
import { supportsNestedActions } from './actions/LiquidityActionHelpers'
import {
  getActionableTokenSymbol,
  getPoolActionableTokens,
  getStandardRootTokens,
  isStandardOrUnderlyingRootToken,
} from './pool-tokens.utils'
import { sDAIWeighted } from './__mocks__/pool-examples/flat'
import { getPoolAddBlockedReason, shouldBlockAddLiquidity } from './pool.helpers'
import { usdcUsdtAaveBoosted } from './__mocks__/pool-examples/boosted'

describe('getPoolActionableTokens', () => {
  it('when nested pool supports nested actions (default behavior)', () => {
    const pool = getApiPoolMock(staBALv2Nested)
    const result = getPoolActionableTokens(pool)
    expect(result.map(t => t.symbol)).toEqual(['USDT', 'USDC', 'WXDAI', 'WETH', 'WBTC']) // contains 'staBAL3' nested tokens (USDT, USDC, WXDAI)
  })

  it('when nested pool does not support nested actions (poolId in disallowNestedActions)', () => {
    const pool = getApiPoolMock(auraBal)
    const result = getPoolActionableTokens(pool)
    expect(result.map(t => t.symbol)).toEqual(['B-80BAL-20WETH', 'auraBAL']) // BPTs should be used to add
  })
})

it('supportsNestedActions', () => {
  const pool = {
    id: '0x12345',
  } as unknown as Pool

  expect(supportsNestedActions(pool)).toBeFalsy()

  expect(
    supportsNestedActions(
      // WETH / osETH Phantom composable stable
      fakeNestedPool('0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635')
    )
  ).toBeTruthy()

  expect(
    supportsNestedActions(
      // Balancer 80 BAL 20 WETH auraBAL',
      fakeNestedPool('0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249')
    )
  ).toBeFalsy()
})

function fakeNestedPool(poolId: string): Pool {
  return {
    id: poolId, // Balancer 80 BAL 20 WETH auraBAL',
    poolTokens: [
      {
        hasNestedPool: true,
      },
    ],
  } as unknown as Pool
}

describe('pool helper', async () => {
  const pool = v3SepoliaNestedBoostedMock // Sepolia 50% WETH - 50% boosted USDC/USDT

  const wethAddress = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9' // root token
  const stataEthUSDCAddress = '0x8a88124522dbbf1e56352ba3de1d9f78c143751e' // Wrapping token with useUnderlyingForAddRemove == false
  const usdcSepoliaAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8' // underlying token
  const usdtSepoliaAddress = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0' // underlying token

  it('poolActionableTokens', async () => {
    const poolActionableTokens = getPoolActionableTokens(pool)
    expect(poolActionableTokens.map(t => t.address).sort()).toEqual([
      wethAddress,
      stataEthUSDCAddress,
      usdtSepoliaAddress,
    ])
  })

  it('isStandardRootToken', async () => {
    expect(isStandardOrUnderlyingRootToken(pool, wethAddress)).toBeTruthy()
    expect(isStandardOrUnderlyingRootToken(pool, usdcSepoliaAddress)).toBeFalsy()
    expect(isStandardOrUnderlyingRootToken(pool, usdtSepoliaAddress)).toBeFalsy()
  })

  it('getStandardRootTokens', async () => {
    const poolActionableTokens = getPoolActionableTokens(pool)

    const standardRootTokens = getStandardRootTokens(pool, poolActionableTokens)
    expect(standardRootTokens.map(t => t.address).sort()).toEqual([wethAddress]) // only WETH is a standard root token
  })

  it('getActionableTokenSymbol ', async () => {
    expect(getActionableTokenSymbol(wethAddress, pool)).toEqual('WETH')
  })
})

describe('shouldBlockAddLiquidity', () => {
  it('v2 pool with ERC4626 token', () => {
    const pool = getApiPoolMock(sDAIWeighted)

    // Should block liquidity if one of the tokens is not allowed
    pool.poolTokens[0].isAllowed = false
    expect(shouldBlockAddLiquidity(pool)).toBe(true)
    expect(getPoolAddBlockedReason(pool)).toBe('Token: wstETH is not allowed')

    // Should not block liquidity if all tokens are allowed
    pool.poolTokens[0].isAllowed = true
    expect(shouldBlockAddLiquidity(pool)).toBe(false)
  })

  it('v3 pool with ERC4626 tokens', () => {
    // Should not block liquidity if all tokenized vaults are reviewed and 'safe'
    const pool1 = getApiPoolMock(usdcUsdtAaveBoosted)
    expect(pool1.poolTokens[0].erc4626ReviewData?.summary).toBe('safe')
    expect(pool1.poolTokens[1].erc4626ReviewData?.summary).toBe('safe')
    expect(shouldBlockAddLiquidity(pool1)).toBe(false)

    // Should block liquidity if the usdt tokenized vault is not reviewed
    const pool2 = getApiPoolMock(usdcUsdtAaveBoosted)
    pool2.poolTokens[0].erc4626ReviewData = null
    expect(shouldBlockAddLiquidity(pool2)).toBe(true)
    expect(getPoolAddBlockedReason(pool2)).toBe(
      'Tokenized vault for token waEthUSDT was not yet reviewed'
    )

    // Should block liquidity if the usdt tokenized vault is not reviewed as 'safe'
    const pool3 = getApiPoolMock(usdcUsdtAaveBoosted)
    pool3.poolTokens[0].erc4626ReviewData!.summary = 'unsafe'
    expect(shouldBlockAddLiquidity(pool3)).toBe(true)
    expect(getPoolAddBlockedReason(pool3)).toBe('Tokenized vault for token waEthUSDT is not safe')
  })

  it('should not block add liquidity if the metadata explicitly allows it', () => {
    const pool = getApiPoolMock(usdcUsdtAaveBoosted)
    expect(shouldBlockAddLiquidity(pool, { allowAddLiquidity: true })).toBe(false)
  })
})
