// Do not edit this file. It was auto-generated by saveApiMocks.ts

import { Pool } from '../../pool.types'

export const osETH_wETH_BPTMock = {
  id: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635',
  address: '0xdacf5fa19b1f720111609043ac67a9818262850c',
  name: 'Balancer osETH/wETH StablePool',
  version: 5,
  owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  swapFeeManager: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  pauseManager: null,
  poolCreator: null,
  decimals: 18,
  factory: '0xdb8d758bcb971e482b2c45f7f8a7740283a1bd3a',
  symbol: 'osETH/wETH-BPT',
  createTime: 1701212579,
  type: 'COMPOSABLE_STABLE',
  chain: 'MAINNET',
  protocolVersion: 2,
  tags: ['INCENTIVIZED'],
  hasErc4626: false,
  hasNestedErc4626: false,
  hasAnyAllowedBuffer: false,
  liquidityManagement: {
    disableUnbalancedLiquidity: null,
  },
  hook: null,
  dynamicData: {
    poolId: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635',
    swapEnabled: true,
    totalLiquidity: '57162947.26',
    totalShares: '17733.371327478520169549',
    fees24h: '11.43',
    surplus24h: '0.00',
    swapFee: '0.0001',
    volume24h: '114301.64',
    holdersCount: '67',
    isInRecoveryMode: false,
    isPaused: false,
    aprItems: [
      {
        id: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635-osETH-yield-apr',
        title: 'osETH APR',
        apr: 0.01633864220456643,
        type: 'IB_YIELD',
        rewardTokenSymbol: 'osETH',
        rewardTokenAddress: '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
      },
      {
        id: '0xc592c33e51a764b94db0702d8baf4035ed577aed-0xba100000625a3754423978a60c9317c58a424e3d-balgauge-BAL-apr',
        title: 'BAL reward APR',
        apr: 5.720174853226088e-7,
        type: 'VEBAL_EMISSIONS',
        rewardTokenSymbol: 'BAL',
        rewardTokenAddress: '0xba100000625a3754423978a60c9317c58a424e3d',
      },
      {
        id: '0xc592c33e51a764b94db0702d8baf4035ed577aed-0xba100000625a3754423978a60c9317c58a424e3d-balgauge-BAL-apr-boost',
        title: 'BAL reward APR',
        apr: 8.580262279839133e-7,
        type: 'STAKING_BOOST',
        rewardTokenSymbol: 'BAL',
        rewardTokenAddress: '0xba100000625a3754423978a60c9317c58a424e3d',
      },
      {
        id: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635-swap-apr-30d',
        title: 'Swap fees APR (30d)',
        apr: 0.002651083666005359,
        type: 'SWAP_FEE_30D',
        rewardTokenSymbol: null,
        rewardTokenAddress: null,
      },
      {
        id: '0xc592c33e51a764b94db0702d8baf4035ed577aed-0x48c3399719b582dd63eb5aadf12a40b4c3f52fa2-reward-SWISE-apr',
        title: 'SWISE reward APR',
        apr: 0.01868475605313782,
        type: 'STAKING',
        rewardTokenSymbol: 'SWISE',
        rewardTokenAddress: '0x48c3399719b582dd63eb5aadf12a40b4c3f52fa2',
      },
      {
        id: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635-swap-apr-24h',
        title: 'Swap fees APR (24h)',
        apr: 0.00003649225654430946,
        type: 'SWAP_FEE_24H',
        rewardTokenSymbol: null,
        rewardTokenAddress: null,
      },
      {
        id: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635-swap-apr',
        title: 'Swap fees APR',
        apr: 0.00003649225654430946,
        type: 'SWAP_FEE',
        rewardTokenSymbol: null,
        rewardTokenAddress: null,
      },
      {
        id: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635-swap-apr-7d',
        title: 'Swap fees APR (7d)',
        apr: 0.01166827393513579,
        type: 'SWAP_FEE_7D',
        rewardTokenSymbol: null,
        rewardTokenAddress: null,
      },
    ],
  },
  allTokens: [
    {
      id: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635-0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      isNested: false,
      isPhantomBpt: false,
      isMainToken: true,
    },
    {
      id: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635-0xdacf5fa19b1f720111609043ac67a9818262850c',
      address: '0xdacf5fa19b1f720111609043ac67a9818262850c',
      name: 'Balancer osETH/wETH StablePool',
      symbol: 'osETH/wETH-BPT',
      decimals: 18,
      isNested: false,
      isPhantomBpt: true,
      isMainToken: false,
    },
    {
      id: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635-0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
      address: '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
      name: 'Staked ETH',
      symbol: 'osETH',
      decimals: 18,
      isNested: false,
      isPhantomBpt: false,
      isMainToken: true,
    },
  ],
  staking: {
    id: '0xc592c33e51a764b94db0702d8baf4035ed577aed',
    type: 'GAUGE',
    chain: 'MAINNET',
    address: '0xc592c33e51a764b94db0702d8baf4035ed577aed',
    gauge: {
      id: '0xc592c33e51a764b94db0702d8baf4035ed577aed',
      gaugeAddress: '0xc592c33e51a764b94db0702d8baf4035ed577aed',
      version: 1,
      status: 'PREFERRED',
      workingSupply: '10181.503396572843805699',
      otherGauges: [],
      rewards: [
        {
          id: '0xc592c33e51a764b94db0702d8baf4035ed577aed-0xba100000625a3754423978a60c9317c58a424e3d-balgauge',
          rewardPerSecond: '0.000000620107064945',
          tokenAddress: '0xba100000625a3754423978a60c9317c58a424e3d',
        },
        {
          id: '0xc592c33e51a764b94db0702d8baf4035ed577aed-0x48c3399719b582dd63eb5aadf12a40b4c3f52fa2-reward',
          rewardPerSecond: '2.14947089947089947',
          tokenAddress: '0x48c3399719b582dd63eb5aadf12a40b4c3f52fa2',
        },
      ],
    },
    aura: {
      id: '0x5f032f15b4e910252edaddb899f7201e89c8cd6b',
      apr: 0.0351,
      auraPoolAddress: '0x5f032f15b4e910252edaddb899f7201e89c8cd6b',
      auraPoolId: '179',
      isShutdown: false,
    },
  },
  userBalance: {
    totalBalance: '0',
    totalBalanceUsd: 0,
    walletBalance: '0',
    walletBalanceUsd: 0,
    stakedBalances: [],
  },
  amp: '200.0',
  nestingType: 'NO_NESTING',
  bptPriceRate: '1.015900412955042934',
  poolTokens: [
    {
      id: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635-0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chain: 'MAINNET',
      chainId: 1,
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      decimals: 18,
      name: 'Wrapped Ether',
      symbol: 'WETH',
      priority: 0,
      tradable: true,
      isErc4626: false,
      index: 0,
      balance: '8146.636151737569',
      balanceUSD: '25934734.72269503',
      priceRate: '1.0',
      weight: null,
      hasNestedPool: false,
      isAllowed: true,
      priceRateProvider: null,
      logoURI:
        'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
      priceRateProviderData: null,
      nestedPool: null,
      isBufferAllowed: true,
      underlyingToken: null,
      erc4626ReviewData: null,
    },
    {
      id: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635-0xdacf5fa19b1f720111609043ac67a9818262850c',
      chain: 'MAINNET',
      chainId: 1,
      address: '0xdacf5fa19b1f720111609043ac67a9818262850c',
      decimals: 18,
      name: 'Balancer osETH/wETH StablePool',
      symbol: 'osETH/wETH-BPT',
      priority: 0,
      tradable: false,
      isErc4626: false,
      index: 1,
      balance: '2596148429267420',
      balanceUSD: '0',
      priceRate: '1.015900412955042934',
      weight: null,
      hasNestedPool: false,
      isAllowed: true,
      priceRateProvider: null,
      logoURI: null,
      priceRateProviderData: null,
      nestedPool: null,
      isBufferAllowed: true,
      underlyingToken: null,
      erc4626ReviewData: null,
    },
    {
      id: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635-0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
      chain: 'MAINNET',
      chainId: 1,
      address: '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
      decimals: 18,
      name: 'Staked ETH',
      symbol: 'osETH',
      priority: 0,
      tradable: true,
      isErc4626: false,
      index: 2,
      balance: '9523.235383276016',
      balanceUSD: '31228212.53942338',
      priceRate: '1.036319708891414826',
      weight: null,
      hasNestedPool: false,
      isAllowed: true,
      priceRateProvider: '0x8023518b2192fb5384dadc596765b3dd1cdfe471',
      logoURI:
        'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xf1c9acdc66974dfb6decb12aa385b9cd01190e38.png',
      priceRateProviderData: {
        address: '0x8023518b2192fb5384dadc596765b3dd1cdfe471',
        name: 'PriceFeed',
        summary: 'safe',
        reviewed: true,
        warnings: [''],
        upgradeableComponents: [],
        reviewFile: './osEthRateProvider.md',
        factory: null,
      },
      nestedPool: null,
      isBufferAllowed: true,
      underlyingToken: null,
      erc4626ReviewData: null,
    },
  ],
} as unknown as Pool