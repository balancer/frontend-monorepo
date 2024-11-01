/* eslint-disable max-len */
import {
  balAddress,
  bpt3PoolAddress,
  daiAddress,
  usdcAddress,
  usdtAddress,
  wETHAddress,
} from '@repo/lib/debug-helpers'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
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

  it('for v2 pool with nested BPTs', async () => {
    // Balancer 50WETH-50-3pool
    const poolId = '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0'
    const nestedPool = await getPoolMock(poolId, GqlChain.Mainnet)
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '100', tokenAddress: daiAddress },
    ]

    expect(allPoolTokens(nestedPool).map(t => t.address)).toEqual([
      daiAddress,
      bpt3PoolAddress,
      usdcAddress,
      usdtAddress,
      wETHAddress,
    ])

    const helpers = new LiquidityActionHelpers(nestedPool)

    expect(helpers.toInputAmounts(humanAmountsIn)).toMatchInlineSnapshot(`
      [
        {
          "address": "0x6b175474e89094c44da98b954eedeac495271d0f",
          "decimals": 18,
          "rawAmount": 100000000000000000000n,
        },
      ]
    `)
  })
})

// Unskip when sepolia V3 pools are available in production api
describe('Liquidity helpers for V3 Boosted pools', async () => {
  const poolId = '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8' // Sepolia stataEthUSDC stataEthUSDT

  const usdcSepoliaAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8'
  const usdtSepoliaAddress = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0'
  const v3Pool = await getPoolMock(poolId, GqlChain.Sepolia)
  const helpers = new LiquidityActionHelpers(v3Pool)

  const humanAmountsIn: HumanTokenAmountWithAddress[] = [
    { humanAmount: '0.1', tokenAddress: usdcSepoliaAddress },
  ]

  it('allPoolTokens', async () => {
    expect(allPoolTokens(v3Pool).map(t => t.address)).toMatchInlineSnapshot([
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
    expect(helpers.boostedPoolState).toMatchInlineSnapshot(`
      {
        "address": "0x6dbdd7a36d900083a5b86a55583d90021e9f33e8",
        "id": "0x6dbdd7a36d900083a5b86a55583d90021e9f33e8",
        "protocolVersion": 3,
        "tokens": [
          {
            "address": "0x8a88124522dbbf1e56352ba3de1d9f78c143751e",
            "balance": "50091.839731",
            "balanceUSD": "57605.61569065",
            "decimals": 6,
            "hasNestedPool": false,
            "id": "0x6dbdd7a36d900083a5b86a55583d90021e9f33e8-0x8a88124522dbbf1e56352ba3de1d9f78c143751e",
            "index": 0,
            "isAllowed": true,
            "isErc4626": true,
            "name": "Static Aave Ethereum USDC",
            "nestedPool": null,
            "priceRate": "1.145966506799814568",
            "priceRateProvider": "0x34101091673238545de8a846621823d9993c3085",
            "priceRateProviderData": null,
            "symbol": "stataEthUSDC",
            "underlyingToken": {
              "address": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
              "decimals": 6,
              "index": 0,
              "name": "USDC (AAVE Faucet)",
              "symbol": "usdc-aave",
            },
            "weight": null,
          },
          {
            "address": "0x978206fae13faf5a8d293fb614326b237684b750",
            "balance": "50078.509111",
            "balanceUSD": "63332.4639216519",
            "decimals": 6,
            "hasNestedPool": false,
            "id": "0x6dbdd7a36d900083a5b86a55583d90021e9f33e8-0x978206fae13faf5a8d293fb614326b237684b750",
            "index": 1,
            "isAllowed": true,
            "isErc4626": true,
            "name": "Static Aave Ethereum USDT",
            "nestedPool": null,
            "priceRate": "1.272714209074833514",
            "priceRateProvider": "0xb1b171a07463654cc1fe3df4ec05f754e41f0a65",
            "priceRateProviderData": null,
            "symbol": "stataEthUSDT",
            "underlyingToken": {
              "address": "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0",
              "decimals": 6,
              "index": 1,
              "name": "USDT (AAVE Faucet)",
              "symbol": "usdt-aave",
            },
            "weight": null,
          },
        ],
        "type": "Stable",
      }
    `)
  })
})
