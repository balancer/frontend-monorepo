import {
  balAddress,
  bpt3PoolAddress,
  poolId,
  wETHAddress,
  wjAuraAddress,
} from '@/lib/debug-helpers'
import {
  aTokenExpandedMock,
  someGqlTokenMocks,
  someTokenExpandedMock,
} from '@/lib/modules/tokens/__mocks__/token.builders'
import {
  GqlChain,
  GqlPoolElement,
  GqlPoolNestingType,
  GqlPoolTokenDetail,
  GqlPoolTokenExpanded,
  GqlPoolType,
  GqlPoolWeighted,
} from '@/lib/shared/services/api/generated/graphql'
import { DeepPartial } from '@apollo/client/utilities'
import { mock } from 'vitest-mock-extended'
import { aGqlStakingMock } from './gqlStaking.builders'
import { getPoolAddress } from '@balancer/sdk'
import { Address, Hex } from 'viem'

export function aBalWethPoolElementMock(...options: Partial<GqlPoolElement>[]): GqlPoolElement {
  const poolId = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014' // 80BAL-20WETH
  const tokens = someGqlTokenMocks(['BAL', 'WETH'])
  const allTokens = someTokenExpandedMock(tokens.map(t => t.address as Address))

  const options2: Partial<GqlPoolElement> = {
    id: poolId,
    address: getPoolAddress(poolId),
    allTokens,
    poolTokens: tokens as unknown as GqlPoolTokenDetail[],
    protocolVersion: 2,
    ...options,
  }

  return aGqlPoolElementMock(options2)
}

export function aWjAuraWethPoolElementMock(...options: Partial<GqlPoolElement>[]): GqlPoolElement {
  const tokens = [
    aTokenExpandedMock({ address: wjAuraAddress }),
    aTokenExpandedMock({ address: wETHAddress }),
  ]

  const options2 = {
    id: poolId,
    address: getPoolAddress(poolId),
    allTokens: tokens,
    poolTokens: tokens as unknown as GqlPoolTokenDetail[],
    protocolVersion: 2,
    ...options,
  }

  return aGqlPoolElementMock(options2)
}

export function toGqlWeighedPoolMock(poolElement: GqlPoolElement): GqlPoolWeighted {
  const pool: GqlPoolWeighted = {
    ...poolElement,
    __typename: 'GqlPoolWeighted',
    nestingType: GqlPoolNestingType.NoNesting,
  }
  return pool
}

export function aGqlPoolElementMock(...options: Partial<GqlPoolElement>[]): GqlPoolElement {
  const defaultPool = mock<GqlPoolElement>()

  const defaultPool1: DeepPartial<GqlPoolElement> = {
    __typename: 'GqlPoolElement',
    protocolVersion: 2,
    address: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
    poolTokens: someGqlTokenMocks(['BAL', 'WETH']),
    allTokens: [
      {
        address: balAddress,
        weight: '0.8',
      },
      {
        address: wETHAddress,
        weight: '0.2',
      },
    ],
    chain: GqlChain.Mainnet,
    createTime: 1620153071,
    decimals: 18,
    displayTokens: [
      {
        address: balAddress,
      },
      {
        address: wETHAddress,
      },
    ],
    dynamicData: {
      totalLiquidity: '176725796.079429',
      totalShares: '13131700.67391808961378162',
      lifetimeVolume: '1221246014.434743',
      lifetimeSwapFees: '5171589.170118799',
      volume24h: '545061.9941007149',
      fees24h: '5450.619941007149',
      holdersCount: '1917',
      swapFee: '0.01',
      swapsCount: '58991',
      apr: {
        apr: {
          total: '0.05',
        },
      },
    },
    factory: '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0',
    id: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
    name: 'Balancer 80 BAL 20 WETH',
    owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
    symbol: 'B-80BAL-20WETH',
    staking: aGqlStakingMock(),
    type: GqlPoolType.Weighted,
  }
  return Object.assign({}, defaultPool, defaultPool1, ...options)
}

export function aNested50Weth503Pool(...options: Partial<GqlPoolElement>[]): GqlPoolElement {
  const tokens = [
    aTokenExpandedMock({
      address: bpt3PoolAddress, // 3POOL-BPT
    }),
    aTokenExpandedMock({ symbol: 'WETH', isMainToken: true }),
  ]

  const allTokens = [
    ...tokens,
    aTokenExpandedMock({ symbol: 'DAI', isMainToken: true }),
    aTokenExpandedMock({ symbol: 'USDC', isMainToken: true }),
    aTokenExpandedMock({ symbol: 'USDT', isMainToken: true }),
  ]

  const defaultOptions: Partial<GqlPoolElement> = {
    id: '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0' as Address,
    address: '0x08775ccb6674d6bdceb0797c364c2653ed84f384',
    type: GqlPoolType.Weighted,
    poolTokens: tokens as unknown as GqlPoolTokenDetail[],
    allTokens,
  }

  return Object.assign({}, aGqlPoolElementMock(defaultOptions), options)
}

export function aPhantomStablePoolMock(): GqlPoolElement {
  const poolId: Hex = '0x42ed016f826165c2e5976fe5bc3df540c5ad0af700000000000000000000058b' // wstETH-rETH-sfrxETH
  const wstETH: Address = '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'
  const sfrxETH: Address = '0xac3e018457b222d93114458476f3e3416abbe38f'
  const rETH: Address = '0xae78736cd615f374d3085123a210448e74fc6393'

  const poolAddress = getPoolAddress(poolId) as Address

  const tokens = [
    {
      address: poolAddress,
      decimals: 18,
      index: 0,
    },
    {
      address: wstETH,
      decimals: 18,
      index: 1,
    },
    {
      address: sfrxETH,
      decimals: 18,
      index: 2,
    },
    {
      address: rETH,
      decimals: 18,
      index: 2,
    },
  ]

  return aGqlPoolElementMock({
    id: poolId,
    address: poolAddress,
    poolTokens: tokens as unknown as GqlPoolTokenDetail[],
    allTokens: tokens as unknown as GqlPoolTokenExpanded[],
    type: GqlPoolType.ComposableStable,
    protocolVersion: 2,
  })
}
