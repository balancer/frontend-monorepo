/* eslint-disable max-len */
import {
  bal80Weth20Address,
  balAddress,
  usdcDaiUsdtBptAddress,
  daiAddress,
  sdBalAddress,
  usdcAddress,
  usdtAddress,
  wETHAddress,
} from '@repo/lib/debug-helpers'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { GqlChain, GqlPoolElement } from '@repo/lib/shared/services/api/generated/graphql'
import { getPoolMock } from '../__mocks__/getPoolMock'
import { allPoolTokens } from '../pool.helpers'
import { LiquidityActionHelpers } from './LiquidityActionHelpers'

describe('Calculates toInputAmounts from allPoolTokens', () => {
  it('for v2 weighted pool with no nested tokens', async () => {
    const poolId = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014' // 80BAL-20WETH

    const pool = await getPoolMock(poolId, GqlChain.Mainnet)

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '100', tokenAddress: balAddress },
    ]

    expect(allPoolTokens(pool).map(t => t.address)).toEqual([balAddress, wETHAddress])

    const helpers = new LiquidityActionHelpers(pool)

    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: balAddress,
        decimals: 18,
        rawAmount: 100000000000000000000n,
      },
    ])
  })

  it('for v2 composable stable pool with a nested phantom BPT', async () => {
    // Balancer 50WETH-50-3pool
    const poolId = '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0'
    const nestedPool = await getPoolMock(poolId, GqlChain.Mainnet)
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '100', tokenAddress: daiAddress },
    ]

    expect(
      allPoolTokens(nestedPool)
        .map(t => t.address)
        .sort()
    ).toEqual([
      daiAddress,
      usdcDaiUsdtBptAddress, // Phantom BPT
      usdcAddress,
      wETHAddress,
      usdtAddress,
    ])

    const helpers = new LiquidityActionHelpers(nestedPool)

    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: daiAddress,
        decimals: 18,
        rawAmount: 100000000000000000000n,
      },
    ])
  })

  it('allPoolTokens for v2 STABLE pool with non-phantom BPT', async () => {
    const poolId = '0x2d011adf89f0576c9b722c28269fcb5d50c2d17900020000000000000000024d' // MAINNET Balancer sdBAL Stable Pool

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      // User can add liquidity with BPT token
      { humanAmount: '100', tokenAddress: bal80Weth20Address },
    ]

    const sdBalPool = await getPoolMock(poolId, GqlChain.Mainnet)

    expect(
      allPoolTokens(sdBalPool)
        .map(t => t.address)
        .sort()
    ).toEqual([bal80Weth20Address, balAddress, wETHAddress, sdBalAddress])

    const helpers = new LiquidityActionHelpers(sdBalPool)

    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: bal80Weth20Address,
        decimals: 18,
        rawAmount: 100000000000000000000n,
      },
    ])
  })
})

// Unskip when sepolia V3 pools are available in production api
describe.skip('Liquidity helpers for V3 Boosted pools', async () => {
  // const poolId = '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8' // Sepolia stataEthUSDC stataEthUSDT

  const usdcSepoliaAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8'
  const usdtSepoliaAddress = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0'
  // const v3Pool = await getPoolMock(poolId, GqlChain.Sepolia)
  const v3Pool = {} as GqlPoolElement
  const helpers = new LiquidityActionHelpers(v3Pool)

  const humanAmountsIn: HumanTokenAmountWithAddress[] = [
    { humanAmount: '0.1', tokenAddress: usdcSepoliaAddress },
  ]

  it('allPoolTokens', async () => {
    expect(allPoolTokens(v3Pool).map(t => t.address)).toEqual([
      usdcSepoliaAddress,
      usdtSepoliaAddress,
    ])
  })

  it('allPoolTokens snapshot', async () => {
    expect(allPoolTokens(v3Pool)).toMatchInlineSnapshot(`
      [
        {
          "address": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
          "decimals": 6,
          "index": 0,
          "name": "USDC (AAVE Faucet)",
          "symbol": "usdc-aave",
        },
        {
          "address": "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0",
          "decimals": 6,
          "index": 1,
          "name": "USDT (AAVE Faucet)",
          "symbol": "usdt-aave",
        },
      ]
    `)
  })

  it('toInputAmounts', async () => {
    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: usdcSepoliaAddress,
        decimals: 6,
        rawAmount: 100000n,
      },
    ])
  })

  it('boostedPoolState', async () => {
    const helpers = new LiquidityActionHelpers(v3Pool)
    expect(helpers.boostedPoolState).toMatchObject({
      address: '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8',
      id: '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8',
      protocolVersion: 3,
      tokens: [
        {
          address: '0x8a88124522dbbf1e56352ba3de1d9f78c143751e',
          balance: expect.any(String),
          balanceUSD: expect.any(String),
          decimals: 6,
          hasNestedPool: false,
          id: '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8-0x8a88124522dbbf1e56352ba3de1d9f78c143751e',
          index: 0,
          isAllowed: true,
          isErc4626: true,
          name: 'Static Aave Ethereum USDC',
          nestedPool: null,
          priceRate: expect.any(String),
          priceRateProvider: '0x34101091673238545de8a846621823d9993c3085',
          priceRateProviderData: null,
          symbol: 'stataEthUSDC',
          underlyingToken: {
            address: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8',
            decimals: 6,
            index: 0,
            name: 'USDC (AAVE Faucet)',
            symbol: 'usdc-aave',
          },
          weight: null,
        },
        {
          address: '0x978206fae13faf5a8d293fb614326b237684b750',
          balance: expect.any(String),
          balanceUSD: expect.any(String),
          decimals: 6,
          hasNestedPool: false,
          id: '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8-0x978206fae13faf5a8d293fb614326b237684b750',
          index: 1,
          isAllowed: true,
          isErc4626: true,
          name: 'Static Aave Ethereum USDT',
          nestedPool: null,
          priceRate: expect.any(String),
          priceRateProvider: '0xb1b171a07463654cc1fe3df4ec05f754e41f0a65',
          priceRateProviderData: null,
          symbol: 'stataEthUSDT',
          underlyingToken: {
            address: '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0',
            decimals: 6,
            index: 1,
            name: 'USDT (AAVE Faucet)',
            symbol: 'usdt-aave',
          },
          weight: null,
        },
      ],
      type: 'Stable',
    })
  })

  it('poolStateWithBalances (that calls boostedPoolStateWithBalances underneath)', async () => {
    const helpers = new LiquidityActionHelpers(v3Pool)
    expect(helpers.poolStateWithBalances).toEqual({
      address: '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8',
      id: '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8',
      protocolVersion: 3,
      tokens: [
        {
          address: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8',
          balance: expect.any(String),
          decimals: 6,
          index: 0,
        },
        {
          address: '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0',
          balance: expect.any(String),
          decimals: 6,
          index: 1,
        },
      ],
      totalShares: expect.any(String),
      type: 'Stable',
    })
  })
})

// Unskip when sepolia V3 pools are available in production api
describe.skip('Liquidity helpers for V3 NESTED pool', async () => {
  // const poolId = '0x0270daf4ee12ccb1abc8aa365054eecb1b7f4f6b' // Sepolia Balancer 50 WETH 50 USD

  const usdcSepoliaAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8'
  const usdtSepoliaAddress = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0'
  // const v3Pool = await getPoolMock(poolId, GqlChain.Sepolia)
  const v3Pool = {} as GqlPoolElement

  const helpers = new LiquidityActionHelpers(v3Pool)
  const wethAddress = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9'

  const usdcUsdtSepoliaBptAddress = '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8'

  const aaveUSDCAddress = '0x8a88124522dbbf1e56352ba3de1d9f78c143751e'
  const aaveUSDTAddress = '0x978206fae13faf5a8d293fb614326b237684b750'

  const humanAmountsIn: HumanTokenAmountWithAddress[] = [
    { humanAmount: '0.1', tokenAddress: usdcSepoliaAddress },
  ]

  it('allPoolTokens', async () => {
    expect(
      allPoolTokens(v3Pool)
        .map(t => t.address)
        .sort()
    ).toEqual([
      usdcUsdtSepoliaBptAddress,
      wethAddress,
      aaveUSDCAddress,
      usdcSepoliaAddress,
      aaveUSDTAddress,
      usdtSepoliaAddress,
    ])
  })

  it('toInputAmounts', async () => {
    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: usdcSepoliaAddress,
        decimals: 6,
        rawAmount: 100000n,
      },
    ])
  })

  it('toInputAmounts', async () => {
    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: usdcSepoliaAddress,
        decimals: 6,
        rawAmount: 100000n,
      },
    ])
  })
})
