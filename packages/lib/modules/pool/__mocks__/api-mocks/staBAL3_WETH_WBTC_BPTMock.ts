// Do not edit this file. It was auto-generated by saveApiMocks.ts

import { Pool } from '../../pool.types'

export const staBAL3_WETH_WBTC_BPTMock = {
  id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053',
  address: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0',
  name: 'Balancer staBAL3-WETH-WBTC',
  version: 4,
  owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  swapFeeManager: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  pauseManager: null,
  poolCreator: null,
  decimals: 18,
  factory: '0x6cad2ea22bfa7f4c14aae92e47f510cd5c509bc7',
  symbol: 'staBAL3-WETH-WBTC-BPT',
  createTime: 1692369290,
  type: 'WEIGHTED',
  chain: 'GNOSIS',
  protocolVersion: 2,
  tags: [],
  hasErc4626: false,
  hasNestedErc4626: false,
  hasAnyAllowedBuffer: false,
  liquidityManagement: {
    disableUnbalancedLiquidity: null,
  },
  hook: null,
  dynamicData: {
    poolId: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053',
    swapEnabled: true,
    totalLiquidity: '37764.30',
    totalShares: '53.291701641748800739',
    fees24h: '6.06',
    surplus24h: '0.00',
    swapFee: '0.003',
    volume24h: '2019.78',
    holdersCount: '26',
    isInRecoveryMode: false,
    isPaused: false,
    aprItems: [
      {
        id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053-swap-apr-24h',
        title: 'Swap fees APR (24h)',
        apr: 0.02928233607107534,
        type: 'SWAP_FEE_24H',
        rewardTokenSymbol: null,
        rewardTokenAddress: null,
      },
      {
        id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053-swap-apr',
        title: 'Swap fees APR',
        apr: 0.02928233607107534,
        type: 'SWAP_FEE',
        rewardTokenSymbol: null,
        rewardTokenAddress: null,
      },
      {
        id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053-swap-apr-7d',
        title: 'Swap fees APR (7d)',
        apr: 10.92550505833983,
        type: 'SWAP_FEE_7D',
        rewardTokenSymbol: null,
        rewardTokenAddress: null,
      },
      {
        id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053-swap-apr-30d',
        title: 'Swap fees APR (30d)',
        apr: 2.532414400241468,
        type: 'SWAP_FEE_30D',
        rewardTokenSymbol: null,
        rewardTokenAddress: null,
      },
    ],
  },
  allTokens: [
    {
      id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053-0x2086f52651837600180de173b09470f54ef74910',
      address: '0x2086f52651837600180de173b09470f54ef74910',
      name: 'Balancer Stable USD',
      symbol: 'staBAL3',
      decimals: 18,
      isNested: false,
      isPhantomBpt: false,
      isMainToken: false,
    },
    {
      id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053-0x4ecaba5870353805a9f068101a40e0f32ed605c6',
      address: '0x4ecaba5870353805a9f068101a40e0f32ed605c6',
      name: 'Tether USD on xDai',
      symbol: 'USDT',
      decimals: 6,
      isNested: true,
      isPhantomBpt: false,
      isMainToken: true,
    },
    {
      id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053-0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
      address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
      name: 'USD//C on xDai',
      symbol: 'USDC',
      decimals: 6,
      isNested: true,
      isPhantomBpt: false,
      isMainToken: true,
    },
    {
      id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053-0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
      address: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
      name: 'Wrapped XDAI',
      symbol: 'WXDAI',
      decimals: 18,
      isNested: true,
      isPhantomBpt: false,
      isMainToken: true,
    },
    {
      id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053-0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',
      address: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',
      name: 'Wrapped Ether on xDai',
      symbol: 'WETH',
      decimals: 18,
      isNested: false,
      isPhantomBpt: false,
      isMainToken: true,
    },
    {
      id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053-0x8e5bbbb09ed1ebde8674cda39a0c169401db4252',
      address: '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252',
      name: 'Wrapped BTC on xDai',
      symbol: 'WBTC',
      decimals: 8,
      isNested: false,
      isPhantomBpt: false,
      isMainToken: true,
    },
  ],
  staking: {
    id: '0x9ff4e3925b88b6885083a88c2283a21cd504d3d4',
    type: 'GAUGE',
    chain: 'GNOSIS',
    address: '0x9ff4e3925b88b6885083a88c2283a21cd504d3d4',
    gauge: {
      id: '0x9ff4e3925b88b6885083a88c2283a21cd504d3d4',
      gaugeAddress: '0x9ff4e3925b88b6885083a88c2283a21cd504d3d4',
      version: 2,
      status: 'PREFERRED',
      workingSupply: '43.680887029627166599',
      otherGauges: [],
      rewards: [
        {
          id: '0x9ff4e3925b88b6885083a88c2283a21cd504d3d4-0x7ef541e2a22058048904fe5744f9c7e4c57af717-balgauge',
          rewardPerSecond: '0.0',
          tokenAddress: '0x7ef541e2a22058048904fe5744f9c7e4c57af717',
        },
      ],
    },
    aura: {
      id: '0x112ea63d3a70bb7926f95da81eadf71aba0f0955',
      apr: 0.0292,
      auraPoolAddress: '0x112ea63d3a70bb7926f95da81eadf71aba0f0955',
      auraPoolId: '13',
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
  nestingType: 'HAS_SOME_PHANTOM_BPT',
  poolTokens: [
    {
      id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053-0x2086f52651837600180de173b09470f54ef74910',
      chain: 'GNOSIS',
      chainId: 100,
      address: '0x2086f52651837600180de173b09470f54ef74910',
      decimals: 18,
      name: 'Balancer Stable USD',
      symbol: 'staBAL3',
      priority: 0,
      tradable: false,
      isErc4626: false,
      index: 0,
      balance: '12337.111372836594',
      balanceUSD: '12398.79692970078',
      priceRate: '1.0',
      weight: '0.33',
      hasNestedPool: true,
      isAllowed: true,
      priceRateProvider: '0x0000000000000000000000000000000000000000',
      logoURI: 'https://assets.coingecko.com/coins/images/32112/large/bal3.png?1696561317',
      priceRateProviderData: null,
      nestedPool: {
        id: '0x2086f52651837600180de173b09470f54ef7491000000000000000000000004f',
        address: '0x2086f52651837600180de173b09470f54ef74910',
        type: 'COMPOSABLE_STABLE',
        bptPriceRate: '1.017904264040247315',
        nestedPercentage: '0.9866292546248749',
        nestedShares: '12337.111372836594',
        totalLiquidity: '12618.77202809665',
        totalShares: '12504.30322738329',
        tokens: [
          {
            index: 0,
            address: '0x2086f52651837600180de173b09470f54ef74910',
            decimals: 18,
            balance: '2561435988828176',
            balanceUSD: '0',
            symbol: 'staBAL3',
            weight: null,
            isErc4626: false,
            isBufferAllowed: true,
            logoURI: 'https://assets.coingecko.com/coins/images/32112/large/bal3.png?1696561317',
            underlyingToken: null,
            erc4626ReviewData: null,
          },
          {
            index: 1,
            address: '0x4ecaba5870353805a9f068101a40e0f32ed605c6',
            decimals: 6,
            balance: '6707.383336064511',
            balanceUSD: '6653.335241142504',
            symbol: 'USDT',
            weight: null,
            isErc4626: false,
            isBufferAllowed: true,
            logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether.png?1668148663',
            underlyingToken: null,
            erc4626ReviewData: null,
          },
          {
            index: 2,
            address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
            decimals: 6,
            balance: '3365.611453751999',
            balanceUSD: '3357.4229210850203',
            symbol: 'USDC',
            weight: null,
            isErc4626: false,
            isBufferAllowed: true,
            logoURI:
              'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389',
            underlyingToken: null,
            erc4626ReviewData: null,
          },
          {
            index: 3,
            address: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
            decimals: 18,
            balance: '2485.860452711346',
            balanceUSD: '2449.097062476198',
            symbol: 'WXDAI',
            weight: null,
            isErc4626: false,
            isBufferAllowed: true,
            logoURI:
              'https://assets.coingecko.com/coins/images/14584/large/wrapped-xdai-logo.png?1696514264',
            underlyingToken: null,
            erc4626ReviewData: null,
          },
        ],
        hook: null,
      },
      isBufferAllowed: true,
      underlyingToken: null,
      erc4626ReviewData: null,
    },
    {
      id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053-0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',
      chain: 'GNOSIS',
      chainId: 100,
      address: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',
      decimals: 18,
      name: 'Wrapped Ether on xDai',
      symbol: 'WETH',
      priority: 0,
      tradable: true,
      isErc4626: false,
      index: 1,
      balance: '4.056564792316558',
      balanceUSD: '12831.84744799951',
      priceRate: '1.0',
      weight: '0.34',
      hasNestedPool: false,
      isAllowed: true,
      priceRateProvider: '0x0000000000000000000000000000000000000000',
      logoURI: 'https://assets.coingecko.com/coins/images/2518/large/weth.png?1628852295',
      priceRateProviderData: null,
      nestedPool: null,
      isBufferAllowed: true,
      underlyingToken: null,
      erc4626ReviewData: null,
    },
    {
      id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053-0x8e5bbbb09ed1ebde8674cda39a0c169401db4252',
      chain: 'GNOSIS',
      chainId: 100,
      address: '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252',
      decimals: 8,
      name: 'Wrapped BTC on xDai',
      symbol: 'WBTC',
      priority: 0,
      tradable: true,
      isErc4626: false,
      index: 2,
      balance: '0.13118892',
      balanceUSD: '12533.65822788',
      priceRate: '1.0',
      weight: '0.33',
      hasNestedPool: false,
      isAllowed: true,
      priceRateProvider: '0x0000000000000000000000000000000000000000',
      logoURI:
        'https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1548822744',
      priceRateProviderData: null,
      nestedPool: null,
      isBufferAllowed: true,
      underlyingToken: null,
      erc4626ReviewData: null,
    },
  ],
} as unknown as Pool