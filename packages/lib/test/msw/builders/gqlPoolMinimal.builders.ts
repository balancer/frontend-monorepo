import {
  GqlChain,
  GqlPoolMinimal,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { DeepPartial } from '@apollo/client/utilities'
import { mock } from 'vitest-mock-extended'

export function aGqlPoolMinimalMock(...options: Partial<GqlPoolMinimal>[]): GqlPoolMinimal {
  const defaultPool = mock<GqlPoolMinimal>()

  const defaultPool1: DeepPartial<GqlPoolMinimal> = {
    address: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
    chain: GqlChain.Mainnet,
    createTime: 1620153071,
    decimals: 18,
    dynamicData: {
      totalLiquidity: '176725796.079429',
      lifetimeVolume: '1221246014.434743',
      lifetimeSwapFees: '5171589.170118799',
      volume24h: '545061.9941007149',
      fees24h: '5450.619941007149',
      holdersCount: '1917',
      swapFee: '0.01',
      swapsCount: '58991',
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
