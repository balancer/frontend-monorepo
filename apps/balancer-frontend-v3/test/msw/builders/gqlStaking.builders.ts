import {
  GqlChain,
  GqlPoolStaking,
  GqlPoolStakingGaugeStatus,
  GqlPoolStakingType,
} from '@/lib/shared/services/api/generated/graphql'

export const defaultTestGaugeAddress = '0x2d42910d826e5500579d121596e98a6eb33c0a1b'

export function aGqlStakingMock(...options: Partial<GqlPoolStaking>[]): GqlPoolStaking {
  const defaultGqlPoolStaking: GqlPoolStaking = {
    __typename: 'GqlPoolStaking',
    id: defaultTestGaugeAddress,
    address: '0x',
    chain: GqlChain.Mainnet,
    type: GqlPoolStakingType.Gauge,
    gauge: {
      __typename: 'GqlPoolStakingGauge',
      id: defaultTestGaugeAddress,
      gaugeAddress: defaultTestGaugeAddress,
      rewards: [],
      status: GqlPoolStakingGaugeStatus.Active,
      version: 2,
      workingSupply: '',
    },
  }

  return Object.assign({}, defaultGqlPoolStaking, ...options)
}
