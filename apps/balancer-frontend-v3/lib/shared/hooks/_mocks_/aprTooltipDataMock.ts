import { GqlPoolAprItem } from '../../services/api/generated/graphql'
import { useAprTooltip } from '../useAprTooltip'

const aprItems = [
  {
    __typename: 'GqlPoolAprItem',
    id: '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112-rETH-yield-apr',
    title: 'rETH APR',
    apr: 0.006773985616957908,
    type: 'IB_YIELD',
  },
  {
    __typename: 'GqlPoolAprItem',
    id: '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112-swap-apr',
    title: 'Swap fees APR',
    apr: 0.0007062046857971015,
    type: 'SWAP_FEE',
  },
  {
    __typename: 'GqlPoolAprItem',
    id: '0x79ef6103a513951a3b25743db509e267685726b7-BAL-apr',
    title: 'BAL reward APR',
    apr: 0.01914598038405333,
    type: 'STAKING',
  },
  {
    __typename: 'GqlPoolAprItem',
    id: '0x79ef6103a513951a3b25743db509e267685726b7-BAL-apr-boost',
    title: 'BAL reward APR',
    apr: 0.02249044497633304,
    type: 'STAKING_BOOST',
  },
] as GqlPoolAprItem[]

const vebalBoost = undefined

export const aprTooltipDataMock = {
  aprItems,
  vebalBoost,
} as Parameters<typeof useAprTooltip>[0]
