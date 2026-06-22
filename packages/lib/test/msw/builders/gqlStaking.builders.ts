import type { GqlPoolStaking } from '@repo/lib/shared/services/api/graphql-derived-types'
import {
  GqlChainValues,
  GqlPoolStakingGaugeStatusValues,
  GqlPoolStakingTypeValues,
} from '@repo/lib/shared/services/api/graphql-enums'

export const defaultTestGaugeAddress = '0x2d42910d826e5500579d121596e98a6eb33c0a1b'

export function aGqlStakingMock(...options: Partial<GqlPoolStaking>[]): GqlPoolStaking {
  const defaultGqlPoolStaking: GqlPoolStaking = {
    __typename: 'GqlPoolStaking',
    id: defaultTestGaugeAddress,
    address: '0x',
    chain: GqlChainValues.Mainnet,
    type: GqlPoolStakingTypeValues.Gauge,
    gauge: {
      __typename: 'GqlPoolStakingGauge',
      id: defaultTestGaugeAddress,
      gaugeAddress: defaultTestGaugeAddress,
      rewards: [],
      otherGauges: [],
      status: GqlPoolStakingGaugeStatusValues.Active,
      version: 2,
      workingSupply: '',
    },
  }

  return Object.assign({}, defaultGqlPoolStaking, ...options)
}
