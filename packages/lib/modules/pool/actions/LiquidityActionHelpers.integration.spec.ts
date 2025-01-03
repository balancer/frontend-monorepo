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
import { Pool } from '../PoolProvider'

describe('Calculates toInputAmounts from allPoolTokens', () => {
  it('for v2 weighted pool with no nested tokens', async () => {
    const poolId = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014' // 80BAL-20WETH

    const pool = await getPoolMock(poolId, GqlChain.Mainnet)

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '100', tokenAddress: balAddress, symbol: 'BAL' },
    ]

    expect(allPoolTokens(pool).map(t => t.address)).toEqual([balAddress, wETHAddress])

    const helpers = new LiquidityActionHelpers(pool)

    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: balAddress,
        decimals: 18,
        rawAmount: 100000000000000000000n,
        symbol: 'BAL',
      },
    ])
  })

  it('for v2 composable stable pool with a nested phantom BPT', async () => {
    // Balancer 50WETH-50-3pool
    const poolId = '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0'
    const nestedPool = await getPoolMock(poolId, GqlChain.Mainnet)
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '100', tokenAddress: daiAddress, symbol: 'DAI' },
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
        symbol: 'DAI',
      },
    ])
  })

  it('allPoolTokens for v2 STABLE pool with non-phantom BPT', async () => {
    const poolId = '0x2d011adf89f0576c9b722c28269fcb5d50c2d17900020000000000000000024d' // MAINNET Balancer sdBAL Stable Pool

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      // User can add liquidity with BPT token
      { humanAmount: '100', tokenAddress: bal80Weth20Address, symbol: '80BAL-20WETH' },
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
        symbol: 'B-80BAL-20WETH',
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
    { humanAmount: '0.1', tokenAddress: usdcSepoliaAddress, symbol: 'USDC' },
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
    { humanAmount: '0.1', tokenAddress: usdcSepoliaAddress, symbol: 'USDC' },
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

// Unskip when sepolia V3 pools are available in production api
test.skip('Nested pool state for V3 BOOSTED POOL', async () => {
  // const poolId = '0xbb83ba331c3254c8c44645430126797dceda89c0' // Sepolia Balancer 50 WETH 50 stataUSDC

  // const v3Pool = await getPoolMock(poolId, GqlChain.Sepolia)
  const v3Pool = {} as Pool

  const helpers = new LiquidityActionHelpers(v3Pool)

  const state = helpers.boostedPoolState

  expect(state).toMatchInlineSnapshot(`
    {
      "address": "0xbb83ba331c3254c8c44645430126797dceda89c0",
      "id": "0xbb83ba331c3254c8c44645430126797dceda89c0",
      "protocolVersion": 3,
      "tokens": [
        {
          "address": "0x7b79995e5f793a07bc00c21412e50ecae098e7f9",
          "balance": "10.030375954528889",
          "balanceUSD": "35947.96468719563",
          "decimals": 18,
          "erc4626ReviewData": null,
          "hasNestedPool": false,
          "id": "0xbb83ba331c3254c8c44645430126797dceda89c0-0x7b79995e5f793a07bc00c21412e50ecae098e7f9",
          "index": 0,
          "isAllowed": true,
          "isErc4626": false,
          "name": "Wrapped Ether",
          "nestedPool": null,
          "priceRate": "1",
          "priceRateProvider": "0x0000000000000000000000000000000000000000",
          "priceRateProviderData": null,
          "symbol": "WETH",
          "underlyingToken": null,
          "weight": "0.5",
        },
        {
          "address": "0x8a88124522dbbf1e56352ba3de1d9f78c143751e",
          "balance": "25922.046716",
          "balanceUSD": "30847.23559204",
          "decimals": 6,
          "erc4626ReviewData": null,
          "hasNestedPool": false,
          "id": "0xbb83ba331c3254c8c44645430126797dceda89c0-0x8a88124522dbbf1e56352ba3de1d9f78c143751e",
          "index": 1,
          "isAllowed": true,
          "isErc4626": true,
          "name": "Static Aave Ethereum USDC",
          "nestedPool": null,
          "priceRate": "1.188770181245210492",
          "priceRateProvider": "0x34101091673238545de8a846621823d9993c3085",
          "priceRateProviderData": {
            "address": "0x34101091673238545de8a846621823d9993c3085",
            "factory": null,
            "name": "waUSDC Rate Provider",
            "reviewFile": "./StatATokenTestnetRateProvider.md",
            "reviewed": true,
            "summary": "safe",
            "upgradeableComponents": [],
            "warnings": [
              "",
            ],
          },
          "symbol": "stataEthUSDC",
          "underlyingToken": {
            "address": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
            "chainId": 11155111,
            "decimals": 6,
            "index": 1,
            "name": "USDC (AAVE Faucet)",
            "symbol": "usdc-aave",
          },
          "weight": "0.5",
        },
      ],
      "totalShares": "555.900851855167757901",
      "type": "Weighted",
    }
  `)
})

// Unskip when sepolia V3 pools are available in production api
test.skip('Nested pool state for V3 NESTED POOL', async () => {
  // const poolId = '0xc9233cc69435591b193b50f702ac31e404a08b10' // Sepolia Balancer 50 WETH 50 USD

  const usdcSepoliaAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8'
  const daiSepoliaAddress = '0xff34b3d4aee8ddcd6f9afffb6fe49bd371b8a357'
  const wethSepoliaAddress = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9'
  // const v3Pool = await getPoolMock(poolId, GqlChain.Sepolia)
  const v3Pool = {} as Pool

  const helpers = new LiquidityActionHelpers(v3Pool)

  const state = helpers.nestedPoolStateV3

  expect(state).toEqual({
    mainTokens: [
      {
        address: wethSepoliaAddress,
        decimals: 18,
        index: 0,
      },
      {
        address: usdcSepoliaAddress,
        decimals: 6,
        index: 0,
      },
      {
        address: daiSepoliaAddress,
        decimals: 18,
        index: 1,
      },
    ],
    pools: [
      {
        address: '0xc9233cc69435591b193b50f702ac31e404a08b10',
        id: '0xc9233cc69435591b193b50f702ac31e404a08b10',
        level: 1,
        tokens: [
          {
            address: wethSepoliaAddress,
            decimals: 18,
            index: 0,
            underlyingToken: null,
          },
          {
            address: '0x946e59e9637f44eb122fe64b372aaf6ed0441da1',
            decimals: 18,
            index: 1,
            underlyingToken: null,
          },
        ],
        type: 'Weighted',
      },
      {
        address: '0x946e59e9637f44eb122fe64b372aaf6ed0441da1',
        id: '0x946e59e9637f44eb122fe64b372aaf6ed0441da1',
        level: 0,
        tokens: [
          {
            address: usdcSepoliaAddress,
            decimals: 6,
            index: 0,
            underlyingToken: null,
          },
          {
            address: daiSepoliaAddress,
            decimals: 18,
            index: 1,
            underlyingToken: null,
          },
        ],
        type: 'Weighted',
      },
    ],
    protocolVersion: 3,
  })
})

describe('Liquidity helpers for GNOSIS V3 Boosted pools', async () => {
  const poolId = '0xd1d7fa8871d84d0e77020fc28b7cd5718c446522' // Gnosis Balancer aGNO/sDAI

  const waGnoGNOAddress = '0x7c16f0185a26db0ae7a9377f23bc18ea7ce5d644'
  const gnoAddress = '0x9c58bacc331c9aa871afd802db6379a98e80cedb'

  const sDaiAddress = '0xaf204776c7245bf4147c2612bf6e5972ee483701'
  const wxDai = '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'

  const v3Pool = await getPoolMock(poolId, GqlChain.Gnosis)
  const helpers = new LiquidityActionHelpers(v3Pool)

  const humanAmountsIn: HumanTokenAmountWithAddress[] = [
    { humanAmount: '0.1', tokenAddress: gnoAddress, symbol: 'GNO' },
  ]

  it('allPoolTokens snapshot', async () => {
    expect(allPoolTokens(v3Pool)).toMatchInlineSnapshot(`
      [
        {
          "address": "0x9c58bacc331c9aa871afd802db6379a98e80cedb",
          "chain": "GNOSIS",
          "chainId": 100,
          "decimals": 18,
          "index": 0,
          "isBufferAllowed": true,
          "isErc4626": false,
          "logoURI": "https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0x9c58bacc331c9aa871afd802db6379a98e80cedb.png",
          "name": "Gnosis Token on xDai",
          "priority": 0,
          "symbol": "GNO",
          "tradable": true,
        },
        {
          "address": "0x7c16f0185a26db0ae7a9377f23bc18ea7ce5d644",
          "decimals": 18,
          "index": 0,
          "name": "Wrapped Aave Gnosis GNO",
          "symbol": "waGnoGNO",
        },
        {
          "address": "0xaf204776c7245bf4147c2612bf6e5972ee483701",
          "decimals": 18,
          "index": 1,
          "name": "Savings xDAI",
          "symbol": "sDAI",
        },
      ]
    `)
  })

  it('toInputAmounts', async () => {
    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: gnoAddress,
        decimals: 18,
        rawAmount: 100000000000000000n,
        symbol: 'GNO',
      },
    ])
  })

  it('boostedPoolState', async () => {
    const helpers = new LiquidityActionHelpers(v3Pool)
    expect(helpers.boostedPoolState).toMatchObject({
      address: poolId,
      id: poolId,
      protocolVersion: 3,
      tokens: [
        {
          address: waGnoGNOAddress,
          balance: expect.any(String),
          balanceUSD: expect.any(String),
          decimals: 18,
          hasNestedPool: false,
          id: '0xd1d7fa8871d84d0e77020fc28b7cd5718c446522-0x7c16f0185a26db0ae7a9377f23bc18ea7ce5d644',
          index: 0,
          isAllowed: true,
          isErc4626: true,
          name: 'Wrapped Aave Gnosis GNO',
          nestedPool: null,
          priceRate: expect.any(String),
          priceRateProvider: '0xbbb4966335677ea24f7b86dc19a423412390e1fb',
          priceRateProviderData: expect.any(Object),
          symbol: 'waGnoGNO',
          underlyingToken: {
            address: gnoAddress,
            decimals: 18,
            index: 0,
            name: 'Gnosis Token on xDai',
            symbol: 'GNO',
          },
          weight: '0.5',
        },
        {
          address: sDaiAddress,
          balance: expect.any(String),
          balanceUSD: expect.any(String),
          decimals: 18,
          hasNestedPool: false,
          id: '0xd1d7fa8871d84d0e77020fc28b7cd5718c446522-0xaf204776c7245bf4147c2612bf6e5972ee483701',
          index: 1,
          isAllowed: true,
          isErc4626: true,
          name: 'Savings xDAI',
          nestedPool: null,
          priceRate: expect.any(String),
          priceRateProvider: '0x89c80a4540a00b5270347e02e2e144c71da2eced',
          priceRateProviderData: expect.any(Object),
          symbol: 'sDAI',
          underlyingToken: {
            address: wxDai,
            decimals: 18,
            index: 1,
            name: 'Wrapped XDAI',
            symbol: 'WXDAI',
          },
          weight: '0.5',
        },
      ],
      type: 'Weighted',
    })
  })

  it('poolStateWithBalances (that calls boostedPoolStateWithBalances underneath)', async () => {
    const helpers = new LiquidityActionHelpers(v3Pool)
    expect(helpers.poolStateWithBalances).toEqual({
      address: poolId,
      id: poolId,
      protocolVersion: 3,
      tokens: [
        {
          address: gnoAddress,
          balance: expect.any(String),
          decimals: 18,
          index: 0,
        },
        {
          address: wxDai,
          balance: expect.any(String),
          decimals: 18,
          index: 1,
        },
      ],
      totalShares: expect.any(String),
      type: 'Weighted',
    })
  })
})

describe('Liquidity helpers for GNOSIS V2 pool with isErc4626 tokens (v2 pools are not boosted so they should not use underlying tokens)', async () => {
  const poolId = '0xbc2acf5e821c5c9f8667a36bb1131dad26ed64f9000200000000000000000063' // Gnosis Balancer 50sDAI-50wstETHr

  const wstETHAddress = '0x6c76971f98945ae98dd7d4dfca8711ebea946ea6'
  const sDaiAddress = '0xaf204776c7245bf4147c2612bf6e5972ee483701'

  const v2Pool = await getPoolMock(poolId, GqlChain.Gnosis)
  const helpers = new LiquidityActionHelpers(v2Pool)

  const humanAmountsIn: HumanTokenAmountWithAddress[] = [
    { humanAmount: '0.1', tokenAddress: sDaiAddress, symbol: 'sDAI' },
  ]

  it('allPoolTokens return sDaiAddress instead of its underlying token cause it a V2 pool', async () => {
    expect(allPoolTokens(v2Pool)).toMatchInlineSnapshot(`
      [
        {
          "address": "0x6c76971f98945ae98dd7d4dfca8711ebea946ea6",
          "decimals": 18,
          "index": 0,
          "name": "Wrapped liquid staked Ether 2.0 from Mainnet",
          "symbol": "wstETH",
        },
        {
          "address": "0xaf204776c7245bf4147c2612bf6e5972ee483701",
          "decimals": 18,
          "index": 1,
          "name": "Savings xDAI",
          "symbol": "sDAI",
        },
      ]
    `)
  })

  it('toInputAmounts', async () => {
    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: sDaiAddress,
        decimals: 18,
        rawAmount: 100000000000000000n,
        symbol: 'sDAI',
      },
    ])
  })

  it('poolStateWithBalances', async () => {
    const helpers = new LiquidityActionHelpers(v2Pool)
    expect(helpers.poolStateWithBalances).toEqual({
      id: poolId,
      address: '0xbc2acf5e821c5c9f8667a36bb1131dad26ed64f9',
      protocolVersion: 2,
      tokens: [
        {
          address: wstETHAddress,
          balance: expect.any(String),
          decimals: 18,
          index: 0,
        },
        {
          address: sDaiAddress,
          balance: expect.any(String),
          decimals: 18,
          index: 1,
        },
      ],
      totalShares: expect.any(String),
      type: 'Weighted',
    })
  })
})
