import {
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { POOL_TYPE_MAP } from '../pool.types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

const defaultPoolTypes = Object.keys(POOL_TYPE_MAP)
  .map(poolType => POOL_TYPE_MAP[poolType as keyof typeof POOL_TYPE_MAP])
  .flat()
  .filter(poolType => poolType !== GqlPoolType.LiquidityBootstrapping)

export const poolListDefaultVariables = {
  first: 20,
  skip: 0,
  orderBy: GqlPoolOrderBy.TotalLiquidity,
  orderDirection: GqlPoolOrderDirection.Desc,
  where: {
    poolTypeIn: defaultPoolTypes,
    poolTypeNotIn: [GqlPoolType.LiquidityBootstrapping],
    chainIn: PROJECT_CONFIG.supportedNetworks,
    userAddress: null,
    minTvl: 0,
    tagIn: null,
    tagNotIn: ['BLACK_LISTED'],
    protocolVersionIn: undefined,
  },
  textSearch: null,
}
