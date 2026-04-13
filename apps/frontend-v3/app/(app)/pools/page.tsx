import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'
import { PromoBanners } from '@repo/lib/shared/components/promos/PromoBanners'
import { PreloadQuery } from '@repo/lib/shared/services/api/apollo-server.client'
import {
  GetPoolsDocument,
  GetFeaturedPoolsDocument,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { mins } from '@repo/lib/shared/utils/time'

const revalidateContext = {
  fetchOptions: { next: { revalidate: mins(1).toSecs() } },
}

const defaultPoolListVariables = {
  first: 20,
  skip: 0,
  orderBy: GqlPoolOrderBy.TotalLiquidity,
  orderDirection: GqlPoolOrderDirection.Desc,
  where: {
    poolTypeIn: [
      GqlPoolType.Weighted,
      GqlPoolType.Stable,
      GqlPoolType.ComposableStable,
      GqlPoolType.MetaStable,
      GqlPoolType.Gyro,
      GqlPoolType.Gyro3,
      GqlPoolType.Gyroe,
      GqlPoolType.CowAmm,
      GqlPoolType.Fx,
      GqlPoolType.QuantAmmWeighted,
      GqlPoolType.Reclamm,
    ],
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

export default async function PoolsPageWrapper() {
  return (
    <PreloadQuery
      context={revalidateContext}
      query={GetFeaturedPoolsDocument}
      variables={{ chains: PROJECT_CONFIG.supportedNetworks }}
    >
      <PreloadQuery
        context={revalidateContext}
        query={GetPoolsDocument}
        variables={defaultPoolListVariables}
      >
        <PoolsPage>
          <PromoBanners />
        </PoolsPage>
      </PreloadQuery>
    </PreloadQuery>
  )
}
