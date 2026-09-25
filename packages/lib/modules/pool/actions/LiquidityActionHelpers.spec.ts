import {
  auraBalAddress,
  bal80Weth20Address,
  balAddress,
  daiAddress,
  osEthAddress,
  osEth_WETH_BptAddress,
  threePoolId,
  usdcAddress,
  usdcDaiUsdtBptAddress,
  usdtAddress,
  wETHAddress,
  waUsdcAddress,
  waUsdtAddress,
} from '@repo/lib/debug-helpers'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { aWjAuraWethPoolElementMock } from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { mock } from 'vitest-mock-extended'
import { getApiPoolMock } from '../__mocks__/api-mocks/api-mocks'
import { nestedPoolMock } from '../__mocks__/nestedPoolMock'
import {
  partialBoosted,
  usdcUsdtAaveBoosted,
  v3SepoliaNestedBoosted,
} from '../__mocks__/pool-examples/boosted'
import {
  cowAmmPoolWethGno,
  gyroV3,
  osETHPhantom,
  sDAIWeighted,
  scUsdStS,
  usdcFlyStS,
} from '../__mocks__/pool-examples/flat'
import { auraBal } from '../__mocks__/pool-examples/nested'
import { recoveryPoolMock } from '../__mocks__/recoveryPoolMock'
import { allPoolTokens } from '../pool-tokens.utils'
import { Pool } from '../pool.types'
import {
  LiquidityActionHelpers,
  areEmptyAmounts,
  requiresProportionalInput,
  requiresProportionalInputReason,
  roundDecimals,
  shouldUseRecoveryRemoveLiquidity,
  supportsNestedActions,
  supportsProportionalAddLiquidityKind,
  supportsProportionalAddLiquidityReasons,
  toPoolState,
} from './LiquidityActionHelpers'
import { GqlPoolTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'
const scUsdAddress = '0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae' as const

describe('Calculates toInputAmounts from allPoolTokens', () => {
  it('for Sonic v2 weighted pool with no nested tokens', () => {
    const pool = getApiPoolMock(scUsdStS)

    const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
      { humanAmount: '100', tokenAddress: sonicTokens.sts, symbol: 'stS' },
    ]

    expect(allPoolTokens(pool).map(t => t.address)).toEqual([
      pool.poolTokens[0]?.address,
      sonicTokens.sts,
    ])

    const helpers = new LiquidityActionHelpers(pool)

    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: sonicTokens.sts,
        decimals: 18,
        rawAmount: 100000000000000000000n,
        symbol: 'stS',
      },
    ])
  })

  // TODO: Drop the Balancer phantom case or add a Beets/Sonic v2 composable-stable fixture.
  it.skip('for v2 composable stable pool with a nested phantom BPT', async () => {
    const nestedPool = getApiPoolMock(osETHPhantom)

    const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
      { humanAmount: '100', tokenAddress: osEthAddress, symbol: 'osETH' },
    ]

    expect(
      allPoolTokens(nestedPool)
        .map(t => t.address)
        .sort()
    ).toEqual([wETHAddress, osEth_WETH_BptAddress, osEthAddress])

    const helpers = new LiquidityActionHelpers(nestedPool)

    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: osEthAddress,
        decimals: 18,
        rawAmount: 100000000000000000000n,
        symbol: 'osETH',
      },
    ])
  })

  // TODO: Drop this auraBAL case; Beets has no matching nested BPT setup.
  it.skip('allPoolTokens for v2 STABLE pool with non-phantom BPT', async () => {
    const sdBalPool = getApiPoolMock(auraBal) // MAINNET Balancer auraBAL Stable Pool

    const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
      // User can add liquidity with BPT token
      { humanAmount: '100', tokenAddress: bal80Weth20Address, symbol: '80BAL-20WETH' },
    ]

    expect(
      allPoolTokens(sdBalPool)
        .map(t => t.address)
        .sort()
    ).toEqual([bal80Weth20Address, auraBalAddress, balAddress, wETHAddress])

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

// TODO: Add a Beets/Sonic fully boosted pool with two ERC4626 tokens and update snapshots.
describe.skip('Liquidity helpers for V3 Boosted pools', async () => {
  const v3BoostedPool = getApiPoolMock(usdcUsdtAaveBoosted)

  const helpers = new LiquidityActionHelpers(v3BoostedPool)

  const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
    { humanAmount: '0.1', tokenAddress: usdcAddress, symbol: 'USDC' },
  ]

  it('allPoolTokens', async () => {
    expect(allPoolTokens(v3BoostedPool).map(t => t.address)).toEqual([
      usdtAddress,
      usdcAddress,
      waUsdtAddress,
      waUsdcAddress,
    ])
  })

  it('allPoolTokens snapshot', async () => {
    expect(allPoolTokens(v3BoostedPool)).toMatchInlineSnapshot(`
      [
        {
          "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
          "chain": "MAINNET",
          "chainId": 1,
          "decimals": 6,
          "index": 0,
          "isErc4626": false,
          "logoURI": "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
          "name": "Tether USD",
          "priority": 0,
          "symbol": "USDT",
          "tradable": true,
        },
        {
          "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          "chain": "MAINNET",
          "chainId": 1,
          "decimals": 6,
          "index": 1,
          "isBufferAllowed": true,
          "isErc4626": false,
          "logoURI": "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
          "name": "USD Coin",
          "priority": 0,
          "symbol": "USDC",
          "tradable": true,
        },
        {
          "address": "0x7bc3485026ac48b6cf9baf0a377477fff5703af8",
          "decimals": 6,
          "index": 0,
          "name": "Wrapped Aave Ethereum USDT",
          "symbol": "waEthUSDT",
        },
        {
          "address": "0xd4fa2d31b7968e448877f69a96de69f5de8cd23e",
          "decimals": 6,
          "index": 1,
          "name": "Wrapped Aave Ethereum USDC",
          "symbol": "waEthUSDC",
        },
      ]
    `)
  })

  it('toInputAmounts', async () => {
    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: usdcAddress,
        decimals: 6,
        rawAmount: 100000n,
        symbol: 'USDC',
      },
    ])
  })

  it('boostedPoolState', async () => {
    const helpers = new LiquidityActionHelpers(v3BoostedPool)

    expect(helpers.boostedPoolState).toMatchObject({
      id: v3BoostedPool.id,
      protocolVersion: 3,
      tokens: [
        {
          address: '0x7bc3485026ac48b6cf9baf0a377477fff5703af8',
          chain: 'MAINNET',
          chainId: 1,
          decimals: 6,
          hasNestedPool: false,
          id: '0x89bb794097234e5e930446c0cec0ea66b35d7570-0x7bc3485026ac48b6cf9baf0a377477fff5703af8',
          index: 0,
          isAllowed: true,
          isErc4626: true,
          name: 'Wrapped Aave Ethereum USDT',
          nestedPool: null,
          symbol: 'waEthUSDT',
          underlyingToken: {
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            chain: 'MAINNET',
            chainId: 1,
            decimals: 6,
            index: 0,
            isErc4626: false,
            name: 'Tether USD',
            symbol: 'USDT',
          },
          weight: null,
        },
        {
          address: '0xd4fa2d31b7968e448877f69a96de69f5de8cd23e',
          chain: 'MAINNET',
          chainId: 1,
          decimals: 6,
          hasNestedPool: false,
          id: '0x89bb794097234e5e930446c0cec0ea66b35d7570-0xd4fa2d31b7968e448877f69a96de69f5de8cd23e',
          index: 1,
          isAllowed: true,
          isErc4626: true,
          name: 'Wrapped Aave Ethereum USDC',
          nestedPool: null,
          symbol: 'waEthUSDC',
          underlyingToken: {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            chain: 'MAINNET',
            chainId: 1,
            decimals: 6,
            index: 1,
            isErc4626: false,
            name: 'USD Coin',
            symbol: 'USDC',
          },
          weight: null,
        },
      ],
      type: 'STABLE',
    })
  })
})

// TODO: Drop this Balancer-only nested boosted pool setup.
describe.skip('Liquidity helpers for V3 NESTED boosted pool', async () => {
  const nestedBoostedPool = getApiPoolMock(v3SepoliaNestedBoosted)

  const usdcSepoliaAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8'
  const usdtSepoliaAddress = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0'

  const helpers = new LiquidityActionHelpers(nestedBoostedPool)
  const wethAddress = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9'

  const bb_a_Usd_Sepolia_BptAddress = '0x59fa488dda749cdd41772bb068bb23ee955a6d7a'

  const aaveUSDCAddress = '0x8a88124522dbbf1e56352ba3de1d9f78c143751e'
  const aaveUSDTAddress = '0x978206fae13faf5a8d293fb614326b237684b750'

  const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
    { humanAmount: '0.1', tokenAddress: usdtSepoliaAddress, symbol: 'USDT' },
  ]

  it('allPoolTokens', async () => {
    expect(
      allPoolTokens(nestedBoostedPool)
        .map(t => t.address)
        .sort()
    ).toEqual([
      bb_a_Usd_Sepolia_BptAddress,
      wethAddress,
      aaveUSDCAddress,
      aaveUSDTAddress,
      usdtSepoliaAddress,
    ])
  })

  it('toInputAmounts', async () => {
    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: usdtSepoliaAddress,
        decimals: 6,
        rawAmount: 100000n,
        symbol: 'usdt-aave',
      },
    ])
  })

  test('nested pool state', async () => {
    const helpers = new LiquidityActionHelpers(nestedBoostedPool)

    const state = helpers.nestedPoolStateV3

    expect(state).toEqual({
      mainTokens: [
        {
          address: usdcSepoliaAddress,
          decimals: 6,
          index: 0,
        },
        {
          address: usdtSepoliaAddress,
          decimals: 6,
          index: 1,
        },
        {
          address: wethAddress,
          decimals: 18,
          index: 1,
        },
      ],
      pools: [
        {
          address: nestedBoostedPool.id,
          id: nestedBoostedPool.address,
          level: 1,
          tokens: [
            {
              address: bb_a_Usd_Sepolia_BptAddress,
              decimals: 18,
              index: 0,
              underlyingToken: null,
            },
            {
              address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
              decimals: 18,
              index: 1,
              underlyingToken: null,
            },
          ],
          type: 'WEIGHTED',
        },
        {
          address: bb_a_Usd_Sepolia_BptAddress,
          id: bb_a_Usd_Sepolia_BptAddress,
          level: 0,
          tokens: [
            {
              address: aaveUSDCAddress,
              decimals: 6,
              index: 0,
              underlyingToken: {
                address: usdcSepoliaAddress,
                decimals: 6,
                index: 0,
              },
            },
            {
              address: aaveUSDTAddress,
              decimals: 6,
              index: 1,
              underlyingToken: {
                address: usdtSepoliaAddress,
                decimals: 6,
                index: 1,
              },
            },
          ],
          type: 'Stable',
        },
      ],
      protocolVersion: 3,
    })
  })
})

// TODO: Add a Beets/Sonic fully boosted pool with two ERC4626 tokens.
test.skip('boostedPoolState pool state for V3 BOOSTED POOL', async () => {
  const v3Pool = getApiPoolMock(usdcUsdtAaveBoosted)

  const helpers = new LiquidityActionHelpers(v3Pool)

  const state = helpers.boostedPoolState

  expect(state).toMatchObject({
    address: '0x89bb794097234e5e930446c0cec0ea66b35d7570',
    id: '0x89bb794097234e5e930446c0cec0ea66b35d7570',
    protocolVersion: 3,
    tokens: [
      {
        address: '0x7bc3485026ac48b6cf9baf0a377477fff5703af8',
        balance: expect.any(String),
        balanceUSD: expect.any(String),
        chain: 'MAINNET',
        chainId: 1,
        decimals: 6,
        hasNestedPool: false,
        id: '0x89bb794097234e5e930446c0cec0ea66b35d7570-0x7bc3485026ac48b6cf9baf0a377477fff5703af8',
        index: 0,
        isAllowed: true,
        isErc4626: true,
        logoURI:
          'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0x7bc3485026ac48b6cf9baf0a377477fff5703af8.png',
        name: 'Wrapped Aave Ethereum USDT',
        nestedPool: null,
        priceRate: expect.any(String),
        symbol: 'waEthUSDT',
        underlyingToken: {
          address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          chain: 'MAINNET',
          chainId: 1,
          decimals: 6,
          index: 0,
          isErc4626: false,
          logoURI:
            'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
          name: 'Tether USD',
          priority: 0,
          symbol: 'USDT',
          tradable: true,
        },
        weight: null,
      },
      {
        address: '0xd4fa2d31b7968e448877f69a96de69f5de8cd23e',
        balance: expect.any(String),
        balanceUSD: expect.any(String),
        chain: 'MAINNET',
        chainId: 1,
        decimals: 6,
        hasNestedPool: false,
        id: '0x89bb794097234e5e930446c0cec0ea66b35d7570-0xd4fa2d31b7968e448877f69a96de69f5de8cd23e',
        index: 1,
        isAllowed: true,
        isErc4626: true,
        logoURI:
          'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xd4fa2d31b7968e448877f69a96de69f5de8cd23e.png',
        name: 'Wrapped Aave Ethereum USDC',
        nestedPool: null,
        priceRate: expect.any(String),
        symbol: 'waEthUSDC',
        underlyingToken: {
          address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          chain: 'MAINNET',
          chainId: 1,
          decimals: 6,
          index: 1,
          isErc4626: false,
          logoURI:
            'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
          name: 'USD Coin',
          priority: 0,
          symbol: 'USDC',
          tradable: true,
        },
        weight: null,
      },
    ],
    type: 'STABLE',
  })
})

// TODO: Switch snapshots to anSSiloWSBoosted and Sonic token addresses.
describe.skip('Liquidity helpers for GNOSIS V3 Boosted pools', async () => {
  const v3Pool = getApiPoolMock(partialBoosted) // Gnosis Balancer aGNO/sDAI

  const waGnoGNOAddress = '0x7c16f0185a26db0ae7a9377f23bc18ea7ce5d644'
  const gnoAddress = '0x9c58bacc331c9aa871afd802db6379a98e80cedb'

  const sDaiAddress = '0xaf204776c7245bf4147c2612bf6e5972ee483701'

  const helpers = new LiquidityActionHelpers(v3Pool)

  const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
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
      address: v3Pool.address,
      id: v3Pool.id,
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
          underlyingToken: null, // sDAI has useUnderlyingForAddRemove false so boostedPoolState does not include underlying token
          weight: '0.5',
        },
      ],
      type: 'WEIGHTED',
    })
  })
})

// TODO: Add a Beets/Sonic v2 pool containing an ERC4626 token.
describe.skip('Liquidity helpers for GNOSIS V2 pool with isErc4626 tokens (v2 pools are not boosted so they should not use underlying tokens)', () => {
  const v2Pool = getApiPoolMock(sDAIWeighted) // Gnosis Balancer 50sDAI-50wstETHr

  const sDaiAddress = '0xaf204776c7245bf4147c2612bf6e5972ee483701'

  const helpers = new LiquidityActionHelpers(v2Pool)

  const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
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
})

// TODO: Drop this auraBAL-specific nested BPT setup.
describe.skip('Liquidity helpers for V2 B-auraBAL-STABLE pool with BPT token in the actionable tokens', () => {
  const v2Pool = getApiPoolMock(auraBal)

  const balWeth8020BptAddress = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56' // 80BAL-20WETH nested BPT that should be used for adds

  const helpers = new LiquidityActionHelpers(v2Pool)

  const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
    { humanAmount: '0.1', tokenAddress: balWeth8020BptAddress, symbol: '80BAL-20WETH' },
  ]

  it('allPoolTokens includes 4 tokens: auraBAL, 80BAL-20WETH BTP and its nested tokens (BAL and WETH)', async () => {
    expect(allPoolTokens(v2Pool)).toMatchObject([
      {
        address: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
        decimals: 18,
        index: 0,
        name: 'Balancer 80 BAL 20 WETH',
        symbol: 'B-80BAL-20WETH',
      },
      {
        address: '0xba100000625a3754423978a60c9317c58a424e3d',
        decimals: 18,
        index: 0,
        symbol: 'BAL',
        weight: '0.8',
      },
      {
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        decimals: 18,
        index: 1,
        symbol: 'WETH',
        weight: '0.2',
      },
      {
        address: '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d',
        decimals: 18,
        index: 1,
        name: 'Aura BAL',
        symbol: 'auraBAL',
      },
    ])
  })

  it('toInputAmounts', async () => {
    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: bal80Weth20Address,
        decimals: 18,
        rawAmount: 100000000000000000n,
        symbol: 'B-80BAL-20WETH',
      },
    ])
  })
})

/*TODO: split LiquidityActionHelpers in two files between this 2 sets of tests*/

describe('areEmptyAmounts', () => {
  test('when all humanAmounts are empty, zero or zero with decimals', () => {
    const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
      { tokenAddress: '0x198d7387Fa97A73F05b8578CdEFf8F2A1f34Cd1F', humanAmount: '', symbol: '' },
      { tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', humanAmount: '0', symbol: '' },
      {
        tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756bb3',
        humanAmount: '0.00',
        symbol: '',
      },
    ]

    expect(areEmptyAmounts(humanAmountsIn)).toBeTruthy()
  })

  test('when  humanAmounts is an empty array', () => {
    const humanAmountsIn: HumanTokenAmountWithSymbol[] = []
    expect(areEmptyAmounts(humanAmountsIn)).toBeTruthy()
  })
})

// TODO: Drop this Balancer nested pool case or supply a Beets/Sonic nested pool fixture.
test.skip('detects pools requiring nested liquidity', () => {
  expect(supportsNestedActions(aWjAuraWethPoolElementMock())).toBeFalsy()
  expect(supportsNestedActions(nestedPoolMock)).toBeTruthy()
})

describe('detects pools requiring recovery removal', () => {
  test('when the pool is in recovery and paused', () => {
    const pausedAndInRecoveryPool: Pool = mock<Pool>({
      dynamicData: { isInRecoveryMode: true, isPaused: true },
    })

    expect(shouldUseRecoveryRemoveLiquidity(pausedAndInRecoveryPool)).toBeTruthy()
  })

  // TODO: Add a Beets/Sonic recovery-mode pool affected by CSP, or drop the Balancer-specific warning.
  test.skip('when the pool is in recovery and affected by CSP', () => {
    expect(shouldUseRecoveryRemoveLiquidity(recoveryPoolMock)).toBeTruthy()
  })
})

it('returns poolState for non nested pools', () => {
  const poolMock = getApiPoolMock(scUsdStS)
  const helpers = new LiquidityActionHelpers(poolMock)
  expect(helpers.poolState.id).toBe(poolMock.id)
})

// TODO: Drop this Balancer nested pool case or supply a Beets/Sonic nested pool fixture.
it.skip('returns NestedPoolState for nested pools', () => {
  const helpers = new LiquidityActionHelpers(nestedPoolMock)
  const nestedPoolState = helpers.nestedPoolStateV2

  expect(nestedPoolState.pools).toHaveLength(2)
  const firstPool = nestedPoolState.pools[0]!
  expect(firstPool!.id).toBe(nestedPoolMock.id)
  expect(firstPool!.tokens.map(t => t.address)).toEqual([usdcDaiUsdtBptAddress, wETHAddress])

  const secondPool = nestedPoolState.pools[1]!
  expect(secondPool.id).toBe(threePoolId)

  expect(secondPool.tokens.sort().map(t => t.address)).toEqual([
    daiAddress,
    usdcDaiUsdtBptAddress,
    usdcAddress,
    usdtAddress,
  ])

  expect(nestedPoolState.mainTokens).toHaveLength(4)

  expect(nestedPoolState.mainTokens.sort().map(t => t.address)).toEqual([
    wETHAddress,
    daiAddress,
    usdcAddress,
    usdtAddress,
  ])
})

describe('toInputAmounts', () => {
  it('when the token input is empty', () => {
    const helpers = new LiquidityActionHelpers(getApiPoolMock(scUsdStS))
    const humanTokenAmountsWithAddress: HumanTokenAmountWithSymbol[] = []
    expect(helpers.toInputAmounts(humanTokenAmountsWithAddress)).toEqual([])
  })

  it('when the token input includes multiple pool tokens', () => {
    const helpers = new LiquidityActionHelpers(getApiPoolMock(scUsdStS))

    const humanTokenAmountsWithAddress: HumanTokenAmountWithSymbol[] = [
      { tokenAddress: scUsdAddress, humanAmount: '10', symbol: '' },
      { tokenAddress: sonicTokens.sts, humanAmount: '20', symbol: 'stS' },
    ]

    expect(helpers.toInputAmounts(humanTokenAmountsWithAddress)).toEqual([
      {
        address: scUsdAddress,
        decimals: 6,
        rawAmount: 10000000n,
        symbol: 'scUSD',
      },
      {
        address: sonicTokens.sts,
        decimals: 18,
        rawAmount: 20000000000000000000n,
        symbol: 'stS',
      },
    ])
  })

  it('when the token input is the native asset', () => {
    const helpers = new LiquidityActionHelpers(getApiPoolMock(scUsdStS))

    const humanTokenAmountsWithAddress: HumanTokenAmountWithSymbol[] = [
      { tokenAddress: sonicTokens.s, humanAmount: '30', symbol: 'S' },
    ]

    expect(helpers.toInputAmounts(humanTokenAmountsWithAddress)).toEqual([
      {
        address: sonicTokens.s,
        decimals: 18,
        rawAmount: 30000000000000000000n,
        symbol: 'S',
      },
    ])
  })

  it('when the token input is zero', () => {
    const helpers = new LiquidityActionHelpers(getApiPoolMock(scUsdStS))

    const humanTokenAmountsWithAddress: HumanTokenAmountWithSymbol[] = [
      { tokenAddress: sonicTokens.ws, humanAmount: '0', symbol: 'wS' },
    ]

    expect(helpers.toInputAmounts(humanTokenAmountsWithAddress)).toEqual([])
  })

  it('when the token input is in scientific notation', () => {
    const helpers = new LiquidityActionHelpers(getApiPoolMock(scUsdStS))

    const humanTokenAmountsWithAddress: HumanTokenAmountWithSymbol[] = [
      { tokenAddress: sonicTokens.sts, humanAmount: '6.1713167421e-8', symbol: 'stS' },
    ]

    expect(helpers.toInputAmounts(humanTokenAmountsWithAddress)).toEqual([
      {
        address: sonicTokens.sts,
        decimals: 18,
        rawAmount: 61713167421n,
        symbol: 'stS',
      },
    ])
  })
})

describe('toSdkInputAmounts', () => {
  it('swaps the native asset by the wrapped native asset', () => {
    const helpers = new LiquidityActionHelpers(getApiPoolMock(scUsdStS))

    const humanTokenAmountsWithAddress: HumanTokenAmountWithSymbol[] = [
      { tokenAddress: sonicTokens.s, humanAmount: '30', symbol: 'stS' },
    ]

    expect(helpers.toSdkInputAmounts(humanTokenAmountsWithAddress)).toEqual([
      {
        address: sonicTokens.ws,
        decimals: 18,
        rawAmount: 30000000000000000000n,
        symbol: 'stS',
      },
    ])
  })
})

test('trimDecimals', () => {
  const humanTokenAmountsWithAddress: HumanTokenAmountWithSymbol[] = [
    { tokenAddress: sonicTokens.s, humanAmount: '0.001013801345314809', symbol: 'S' },
    { tokenAddress: sonicTokens.ws, humanAmount: '0.001302248169953014', symbol: 'wS' },
  ]

  expect(roundDecimals(humanTokenAmountsWithAddress)).toEqual([
    {
      humanAmount: '0.0010138013',
      tokenAddress: sonicTokens.s,
    },
    {
      humanAmount: '0.0013022481',
      tokenAddress: sonicTokens.ws,
    },
  ])
})

test('toPoolState keeps pool type when pool is V3 (it does not call mapPoolType)', () => {
  // We don't need a real QuantAMM mock as changing the type is enough
  const quantAMMPool = {
    ...getApiPoolMock(usdcFlyStS),
    type: GqlPoolTypeValues.QuantAmmWeighted,
  }

  expect(toPoolState(quantAMMPool).type).toEqual(GqlPoolTypeValues.QuantAmmWeighted)
})

describe('supportsProportionalAddLiquidityKind', () => {
  it('should not allow proportional add for v2 stable pools', () => {
    const pool = getApiPoolMock(scUsdStS)
    pool.type = GqlPoolTypeValues.Stable

    expect(supportsProportionalAddLiquidityKind(pool)).toBe(false)
    expect(supportsProportionalAddLiquidityReasons(pool)).not.toBeUndefined()
  })

  it('should not allow proportional add for v2 metastable pools', () => {
    const pool = getApiPoolMock(scUsdStS)
    pool.type = GqlPoolTypeValues.MetaStable

    expect(supportsProportionalAddLiquidityKind(pool)).toBe(false)
    expect(supportsProportionalAddLiquidityReasons(pool)).not.toBeUndefined()
  })

  // TODO: Add a Beets/Sonic v2 WeightedPool2TokensFactory pool; Sonic has no configured factory.
  it.skip('should not allow proportional add for v2 weighted 2 tokens', () => {
    const pool = getApiPoolMock(scUsdStS)
    pool.type = GqlPoolTypeValues.Weighted

    pool.factory =
      getNetworkConfig(pool.chain).contracts.balancer?.WeightedPool2TokensFactory ?? null

    expect(supportsProportionalAddLiquidityKind(pool)).toBe(false)
    expect(supportsProportionalAddLiquidityReasons(pool)).not.toBeUndefined()
  })

  it('should not allow proportional add for weightedV1 pools (non v3)', () => {
    const pool = getApiPoolMock(scUsdStS)
    pool.version = 1
    pool.type = GqlPoolTypeValues.Weighted
    pool.protocolVersion = 2

    expect(supportsProportionalAddLiquidityKind(pool)).toBe(false)
    expect(supportsProportionalAddLiquidityReasons(pool)).not.toBeUndefined()
  })

  it('should allow proportional add for weightedV1 pools (v3)', () => {
    const pool = getApiPoolMock(usdcFlyStS)
    pool.version = 1
    pool.type = GqlPoolTypeValues.Weighted
    pool.protocolVersion = 3

    expect(supportsProportionalAddLiquidityKind(pool)).toBe(true)
    expect(supportsProportionalAddLiquidityReasons(pool)).toBeUndefined()
  })

  it('should allow proportional add for other pools (e.g. autoRange)', () => {
    const pool = getApiPoolMock(usdcFlyStS)
    pool.type = GqlPoolTypeValues.Reclamm
    pool.protocolVersion = 3

    expect(supportsProportionalAddLiquidityKind(pool)).toBe(true)
    expect(supportsProportionalAddLiquidityReasons(pool)).toBeUndefined()
  })
})

describe('requiresProportionalInput', () => {
  // TODO: Add a Beets/Sonic Gyro/ECLP v3 pool fixture.
  it.skip('should NOT require for gyro V3 pools', () => {
    const pool = getApiPoolMock(gyroV3)
    pool.protocolVersion = 3

    expect(requiresProportionalInput(pool)).toBe(false)
    expect(requiresProportionalInputReason(pool)).toBeUndefined()
  })

  // TODO: Add a Beets/Sonic Gyro/ECLP v2 pool fixture.
  it.skip('should require for gyro V2 pools', () => {
    const pool = getApiPoolMock(gyroV3)
    pool.protocolVersion = 2

    expect(requiresProportionalInput(pool)).toBe(true)
    expect(requiresProportionalInputReason(pool)).not.toBeUndefined()
  })

  // TODO: Drop CoW-specific coverage when retiring Balancer-only pool support.
  it.skip('should require for Cow pools', () => {
    const pool = getApiPoolMock(cowAmmPoolWethGno)

    expect(requiresProportionalInput(pool)).toBe(true)
    expect(requiresProportionalInputReason(pool)).not.toBeUndefined()
  })

  it('should require when unbalanced liquidity is disabled on v3', () => {
    const pool = getApiPoolMock(usdcFlyStS)

    pool.liquidityManagement = {
      __typename: 'LiquidityManagement',
      disableUnbalancedLiquidity: true,
    }

    expect(requiresProportionalInput(pool)).toBe(true)
    expect(requiresProportionalInputReason(pool)).not.toBeUndefined()
  })

  it('should allow unbalanced add liquidity for other pools (e.g. v3 weighted)', () => {
    const pool = getApiPoolMock(usdcFlyStS)

    expect(requiresProportionalInput(pool)).toBe(false)
    expect(requiresProportionalInputReason(pool)).toBeUndefined()
  })
})
