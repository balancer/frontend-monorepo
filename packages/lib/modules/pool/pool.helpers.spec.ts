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
import {
  stableSurgeBoosted,
  usdcUsdtAaveBoosted,
  v3SepoliaNestedBoosted,
} from './__mocks__/pool-examples/boosted'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { zeroAddress } from 'viem'

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
  describe('v2 pool with ERC4626 token', () => {
    it('should block liquidity if one of the tokens is not allowed', () => {
      const pool = getApiPoolMock(sDAIWeighted)

      pool.poolTokens[0].isAllowed = false
      expect(shouldBlockAddLiquidity(pool)).toBe(true)
      expect(getPoolAddBlockedReason(pool)).toHaveLength(1)
    })

    it('should not block liquidity if all tokens are allowed', () => {
      const pool = getApiPoolMock(sDAIWeighted)

      pool.poolTokens[0].isAllowed = true
      expect(shouldBlockAddLiquidity(pool)).toBe(false)
    })
  })

  describe('v3 pool with ERC4626 tokens', () => {
    it('Should not block liquidity if all tokenized vaults are reviewed and safe', () => {
      const pool = getApiPoolMock(usdcUsdtAaveBoosted)
      expect(pool.poolTokens[0].erc4626ReviewData?.summary).toBe('safe')
      expect(pool.poolTokens[1].erc4626ReviewData?.summary).toBe('safe')
      expect(shouldBlockAddLiquidity(pool)).toBe(false)
    })

    it('should block liquidity if the usdt tokenized vault is not reviewed', () => {
      const pool = getApiPoolMock(usdcUsdtAaveBoosted)
      pool.poolTokens[0].erc4626ReviewData = null
      expect(shouldBlockAddLiquidity(pool)).toBe(true)
      expect(getPoolAddBlockedReason(pool)).toHaveLength(1)
    })

    it('Should block liquidity if the usdt tokenized vault is not reviewed as safe', () => {
      const pool = getApiPoolMock(usdcUsdtAaveBoosted)
      pool.poolTokens[0].erc4626ReviewData!.summary = 'unsafe'
      expect(shouldBlockAddLiquidity(pool)).toBe(true)
      expect(getPoolAddBlockedReason(pool)).toHaveLength(1)
    })

    it('should block if pool is LBP', () => {
      const pool = getApiPoolMock(usdcUsdtAaveBoosted)
      pool.type = GqlPoolType.LiquidityBootstrapping

      expect(shouldBlockAddLiquidity(pool)).toBe(true)
      expect(getPoolAddBlockedReason(pool)).toHaveLength(1)
    })

    it('should block if pool is paused', () => {
      const pool = getApiPoolMock(usdcUsdtAaveBoosted)
      pool.dynamicData.isPaused = true

      expect(shouldBlockAddLiquidity(pool)).toBe(true)
      expect(getPoolAddBlockedReason(pool)).toHaveLength(1)
    })

    it('should block if pool is in recovery mode', () => {
      const pool = getApiPoolMock(usdcUsdtAaveBoosted)
      pool.dynamicData.isInRecoveryMode = true

      expect(shouldBlockAddLiquidity(pool)).toBe(true)
      expect(getPoolAddBlockedReason(pool)).toHaveLength(1)
    })

    it('should block if pool has a hook that is not reviewed', () => {
      const pool = getApiPoolMock(stableSurgeBoosted)
      pool.hook!.reviewData = null

      expect(shouldBlockAddLiquidity(pool)).toBe(true)
      expect(getPoolAddBlockedReason(pool)).toHaveLength(1)
    })

    it('should block if pool has a hook that is unsafe', () => {
      const pool = getApiPoolMock(stableSurgeBoosted)
      pool.hook!.reviewData!.summary = 'unsafe'

      expect(shouldBlockAddLiquidity(pool)).toBe(true)
      expect(getPoolAddBlockedReason(pool)).toHaveLength(1)
    })

    it('should block if pool token is not reviewed', () => {
      const pool = getApiPoolMock(usdcUsdtAaveBoosted)
      pool.poolTokens[0].priceRateProviderData = null

      expect(shouldBlockAddLiquidity(pool)).toBe(true)
      expect(getPoolAddBlockedReason(pool)).toHaveLength(1)
    })

    it('should block if pool token is not safe', () => {
      const pool = getApiPoolMock(usdcUsdtAaveBoosted)
      pool.poolTokens[0].priceRateProviderData!.summary = 'unsafe'

      expect(shouldBlockAddLiquidity(pool)).toBe(true)
      expect(getPoolAddBlockedReason(pool)).toHaveLength(1)
    })

    it('should not block if no reviewer', () => {
      const pool = getApiPoolMock(usdcUsdtAaveBoosted)
      pool.poolTokens[0].priceRateProvider = null

      expect(shouldBlockAddLiquidity(pool)).toBe(false)
    })

    it('should not block if reviewer is zero address', () => {
      const pool = getApiPoolMock(usdcUsdtAaveBoosted)
      pool.poolTokens[0].priceRateProvider = zeroAddress
      pool.poolTokens[0].priceRateProviderData!.summary = 'unsafe'

      expect(shouldBlockAddLiquidity(pool)).toBe(false)
    })

    it('should not block if reviewer is the nested pool', () => {
      const pool = getApiPoolMock(v3SepoliaNestedBoosted)
      pool.chain = GqlChain.Mainnet // Sepolia pools are never blocked
      pool.poolTokens[0].priceRateProvider = pool.poolTokens[0].nestedPool!.address
      pool.poolTokens[0].priceRateProviderData = null

      expect(shouldBlockAddLiquidity(pool)).toBe(false)
    })

    it('should return multiple reasons if present', () => {
      const pool = getApiPoolMock(usdcUsdtAaveBoosted)
      pool.poolTokens[0].erc4626ReviewData!.summary = 'unsafe'
      pool.poolTokens[1].erc4626ReviewData!.summary = 'unsafe'
      expect(getPoolAddBlockedReason(pool)).toHaveLength(2)
    })
  })

  it('should not block add liquidity if the metadata explicitly allows it', () => {
    const pool = getApiPoolMock(usdcUsdtAaveBoosted)
    expect(shouldBlockAddLiquidity(pool, { allowAddLiquidity: true })).toBe(false)
  })

  it('should not block for Sepolia pools', () => {
    const pool = getApiPoolMock(usdcUsdtAaveBoosted)
    pool.dynamicData.isPaused = true
    pool.chain = GqlChain.Sepolia

    expect(shouldBlockAddLiquidity(pool)).toBe(false)
    expect(getPoolAddBlockedReason(pool)).toHaveLength(0)
  })
})
