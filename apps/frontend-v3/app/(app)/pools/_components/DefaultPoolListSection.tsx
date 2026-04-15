import { PreloadQuery } from '@repo/lib/shared/services/api/apollo-server.client'
import {
  GetPoolsDocument,
  GqlChain,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { PoolList } from '@repo/lib/modules/pool/PoolList/PoolList'
import { POOL_TYPE_MAP } from '@repo/lib/modules/pool/pool.types'

const mappedPoolTypes = Object.values(POOL_TYPE_MAP).flat()

const defaultVariables = {
  first: 20,
  skip: 0,
  orderBy: GqlPoolOrderBy.TotalLiquidity,
  orderDirection: GqlPoolOrderDirection.Desc,
  where: {
    poolTypeIn: mappedPoolTypes.filter(t => t !== GqlPoolType.LiquidityBootstrapping),
    poolTypeNotIn: [GqlPoolType.LiquidityBootstrapping],
    chainIn: PROJECT_CONFIG.supportedNetworks as GqlChain[],
    tagNotIn: ['BLACK_LISTED'],
  },
  textSearch: undefined,
}

export async function DefaultPoolListSection() {
  return (
    <PreloadQuery query={GetPoolsDocument} variables={defaultVariables}>
      <PoolList />
    </PreloadQuery>
  )
}
