import {
  GqlChain,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { POOL_TYPE_MAP } from '../pool.types'

const mappedPoolTypes = Object.values(POOL_TYPE_MAP).flat() as GqlPoolType[]

export const poolListDefaultVariables = {
  first: 20,
  skip: 0,
  orderBy: GqlPoolOrderBy.TotalLiquidity,
  orderDirection: GqlPoolOrderDirection.Desc,
  where: {
    poolTypeIn: mappedPoolTypes.filter(t => t !== GqlPoolType.LiquidityBootstrapping),
    poolTypeNotIn: [GqlPoolType.LiquidityBootstrapping],
    chainIn: PROJECT_CONFIG.supportedNetworks as GqlChain[],
    userAddress: null,
    minTvl: 0,
    tagIn: null,
    tagNotIn: ['BLACK_LISTED'],
    protocolVersionIn: undefined,
  },
  textSearch: null,
}
