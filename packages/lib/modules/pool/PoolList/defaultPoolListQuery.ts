import {
  GetPoolsQueryVariables,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { POOL_TYPE_MAP } from '../pool.types'
import { isEqual, uniq } from 'lodash'

export function getDefaultPoolListQueryVariables(): GetPoolsQueryVariables {
  const mappedPoolTypes = uniq(
    Object.keys(POOL_TYPE_MAP)
      .map(poolType => POOL_TYPE_MAP[poolType as keyof typeof POOL_TYPE_MAP])
      .flat()
  )

  return {
    first: 20,
    skip: 0,
    orderBy: GqlPoolOrderBy.TotalLiquidity,
    orderDirection: GqlPoolOrderDirection.Desc,
    where: {
      poolTypeIn: mappedPoolTypes.filter(
        poolType => poolType !== GqlPoolType.LiquidityBootstrapping
      ),
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
}

export function isDefaultPoolListQueryVariables(variables: GetPoolsQueryVariables) {
  return isEqual(variables, getDefaultPoolListQueryVariables())
}
