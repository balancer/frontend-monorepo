// Do not edit this file. It was auto-generated by saveApiMocks.ts

import { Pool } from '../../pool.types'

export const b_auraBAL_STABLEMock = {
  id: '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249',
  address: '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd',
  name: 'Balancer auraBAL Stable Pool',
  version: 2,
  owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  swapFeeManager: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  pauseManager: null,
  poolCreator: null,
  decimals: 18,
  factory: '0x8df6efec5547e31b0eb7d1291b511ff8a2bf987c',
  symbol: 'B-auraBAL-STABLE',
  createTime: 1655199962,
  type: 'STABLE',
  chain: 'MAINNET',
  protocolVersion: 2,
  tags: [],
  hasErc4626: false,
  hasNestedErc4626: false,
  liquidityManagement: {
    disableUnbalancedLiquidity: null,
  },
  hook: null,
  dynamicData: {
    poolId: '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249',
    swapEnabled: true,
    totalLiquidity: '3123471.78',
    totalShares: '533569.446560094871236539',
    fees24h: '120.78',
    surplus24h: '0.00',
    swapFee: '0.003',
    volume24h: '40260.11',
    holdersCount: '52',
    isInRecoveryMode: false,
    isPaused: false,
    aprItems: [
      {
        id: '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249-swap-apr-24h',
        title: 'Swap fees APR (24h)',
        apr: 0.00705702288850616,
        type: 'SWAP_FEE_24H',
        rewardTokenSymbol: null,
        rewardTokenAddress: null,
      },
      {
        id: '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249-swap-apr',
        title: 'Swap fees APR',
        apr: 0.00705702288850616,
        type: 'SWAP_FEE',
        rewardTokenSymbol: null,
        rewardTokenAddress: null,
      },
      {
        id: '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249-swap-apr-30d',
        title: 'Swap fees APR (30d)',
        apr: 0.6303075756650058,
        type: 'SWAP_FEE_30D',
        rewardTokenSymbol: null,
        rewardTokenAddress: null,
      },
      {
        id: '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249-swap-apr-7d',
        title: 'Swap fees APR (7d)',
        apr: 2.713330529781715,
        type: 'SWAP_FEE_7D',
        rewardTokenSymbol: null,
        rewardTokenAddress: null,
      },
    ],
  },
  staking: {
    id: '0x0312aa8d0ba4a1969fddb382235870bf55f7f242',
    type: 'GAUGE',
    chain: 'MAINNET',
    address: '0x0312aa8d0ba4a1969fddb382235870bf55f7f242',
    gauge: {
      id: '0x0312aa8d0ba4a1969fddb382235870bf55f7f242',
      gaugeAddress: '0x0312aa8d0ba4a1969fddb382235870bf55f7f242',
      version: 1,
      status: 'PREFERRED',
      workingSupply: '429382.052022825730905689',
      otherGauges: [],
      rewards: [
        {
          id: '0x0312aa8d0ba4a1969fddb382235870bf55f7f242-0xba100000625a3754423978a60c9317c58a424e3d-balgauge',
          rewardPerSecond: '0',
          tokenAddress: '0xba100000625a3754423978a60c9317c58a424e3d',
        },
      ],
    },
    aura: {
      id: '0x89d3d732da8bf0f88659cf3738e5e44e553f9ed7',
      apr: 0.1645,
      auraPoolAddress: '0x89d3d732da8bf0f88659cf3738e5e44e553f9ed7',
      auraPoolId: '101',
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
  amp: '50.0',
  poolTokens: [
    {
      id: '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249-0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
      chain: 'MAINNET',
      chainId: 1,
      address: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
      decimals: 18,
      name: 'Balancer 80 BAL 20 WETH',
      symbol: 'B-80BAL-20WETH',
      priority: 0,
      tradable: false,
      canUseBufferForSwaps: null,
      useWrappedForAddRemove: null,
      useUnderlyingForAddRemove: null,
      index: 0,
      balance: '67489.94631208607',
      balanceUSD: '423161.9633767796',
      priceRate: '1.0',
      weight: null,
      hasNestedPool: true,
      isAllowed: true,
      priceRateProvider: null,
      logoURI:
        'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56.png',
      priceRateProviderData: null,
      nestedPool: {
        id: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
        address: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
        type: 'WEIGHTED',
        bptPriceRate: '1.0',
        nestedPercentage: '0.010442226415866831',
        nestedShares: '67489.94631208607',
        totalLiquidity: '41226663.09902953',
        totalShares: '6463175.919029677',
        tokens: [
          {
            index: 0,
            address: '0xba100000625a3754423978a60c9317c58a424e3d',
            decimals: 18,
            balance: '193444.17945273715',
            balanceUSD: '344330.63942587207',
            symbol: 'BAL',
            weight: '0.8',
            isErc4626: false,
            isBufferAllowed: true,
            canUseBufferForSwaps: null,
            useWrappedForAddRemove: null,
            useUnderlyingForAddRemove: null,
            logoURI:
              'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xba100000625a3754423978a60c9317c58a424e3d.png',
            underlyingToken: null,
            erc4626ReviewData: null,
          },
          {
            index: 1,
            address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            decimals: 18,
            balance: '36.629461286449356',
            balanceUSD: '86167.51102485631',
            symbol: 'WETH',
            weight: '0.2',
            isErc4626: false,
            isBufferAllowed: true,
            canUseBufferForSwaps: null,
            useWrappedForAddRemove: null,
            useUnderlyingForAddRemove: null,
            logoURI:
              'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
            underlyingToken: null,
            erc4626ReviewData: null,
          },
        ],
        hook: null,
      },
      isErc4626: false,
      isBufferAllowed: true,
      underlyingToken: null,
      erc4626ReviewData: null,
    },
    {
      id: '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249-0x616e8bfa43f920657b3497dbf40d6b1a02d4608d',
      chain: 'MAINNET',
      chainId: 1,
      address: '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d',
      decimals: 18,
      name: 'Aura BAL',
      symbol: 'auraBAL',
      priority: 0,
      tradable: true,
      canUseBufferForSwaps: null,
      useWrappedForAddRemove: null,
      useUnderlyingForAddRemove: null,
      index: 1,
      balance: '494562.2367765659',
      balanceUSD: '2700309.81280005',
      priceRate: '1.0',
      weight: null,
      hasNestedPool: false,
      isAllowed: true,
      priceRateProvider: null,
      logoURI:
        'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0x616e8bfa43f920657b3497dbf40d6b1a02d4608d.png',
      priceRateProviderData: null,
      nestedPool: null,
      isErc4626: false,
      isBufferAllowed: true,
      underlyingToken: null,
      erc4626ReviewData: null,
    },
  ],
} as unknown as Pool
