import {
  GqlBalancePoolAprItem,
  GqlChain,
  GqlPoolApr,
  GqlPoolAprValue,
  GqlPoolMinimal,
  GqlPoolType,
} from '@/lib/shared/services/api/generated/graphql'
import { DeepPartial } from '@apollo/client/utilities'
import { mock, mockDeep } from 'vitest-mock-extended'

export function aGqlPoolMinimalMock(...options: Partial<GqlPoolMinimal>[]): GqlPoolMinimal {
  const defaultPool = mock<GqlPoolMinimal>()

  const defaultPool1: DeepPartial<GqlPoolMinimal> = {
    address: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
    allTokens: [
      {
        address: '0xba100000625a3754423978a60c9317c58a424e3d',
        weight: '0.8',
      },
      {
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        weight: '0.2',
      },
    ],
    chain: GqlChain.Mainnet,
    createTime: 1620153071,
    decimals: 18,
    displayTokens: [
      {
        address: '0xba100000625a3754423978a60c9317c58a424e3d',
      },
      {
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      },
    ],
    dynamicData: {
      totalLiquidity: '176725796.079429',
      lifetimeVolume: '1221246014.434743',
      lifetimeSwapFees: '5171589.170118799',
      volume24h: '545061.9941007149',
      fees24h: '5450.619941007149',
      holdersCount: '1917',
      swapFee: '0.01',
      swapsCount: '58991',
      apr: anAprMock(),
    },
    factory: '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0',
    id: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
    name: 'Balancer 80 BAL 20 WETH',
    owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
    symbol: 'B-80BAL-20WETH',
    type: GqlPoolType.Weighted,
  }
  return Object.assign({}, defaultPool, defaultPool1, ...options)
}

export function anAprMock(): GqlPoolApr {
  const mockedApr = mockDeep<GqlPoolApr>()
  const defaultApr: GqlPoolApr = {
    __typename: 'GqlPoolApr',
    apr: aGplPoolAprValueMock(),
    hasRewardApr: false,
    thirdPartyApr: aGplPoolAprValueMock(),
    nativeRewardApr: aGplPoolAprValueMock(),
    swapApr: '0.005628271838682321',
    items: [
      {
        __typename: 'GqlBalancePoolAprItem',
        id: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014-swap-apr',
        title: 'Swap fees APR',
        apr: aGplPoolAprValueMock(),
      },
    ],
  }
  return Object.assign({}, mockedApr, defaultApr)
}

export function aGplPoolAprValueMock(): GqlPoolAprValue {
  return {
    __typename: 'GqlPoolAprTotal',
    total: '0.005628271838682321',
  }
}

export function aGqlBalancePoolAprItemMock(): GqlBalancePoolAprItem {
  return {
    __typename: 'GqlBalancePoolAprItem',
    apr: aGplPoolAprValueMock(),
    id: '1',
    title: 'Swap fees APR',
  }
}
