import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'
import { BeetsPromoBanner } from '@/lib/components/promos/BeetsPromoBanner'
import {
  GetStakedSonicDataDocument,
  GetPoolsDocument,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import {
  getApolloServerClient,
  PreloadQuery,
} from '@repo/lib/shared/services/api/apollo-server.client'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

const revalidateContext = {
  fetchOptions: { next: { revalidate: 60 } },
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
  const client = getApolloServerClient()

  const { data: stakedSonicData } = await client.query({
    query: GetStakedSonicDataDocument,
    variables: {},
  })

  if (!stakedSonicData) return null

  return (
    <PreloadQuery
      context={revalidateContext}
      query={GetPoolsDocument}
      variables={defaultPoolListVariables}
    >
      <PoolsPage rewardsClaimed24h={stakedSonicData.stsGetGqlStakedSonicData.rewardsClaimed24h}>
        {/* TODO: add <PromoBanners /> at a later date */}
        <BeetsPromoBanner />
      </PoolsPage>
    </PreloadQuery>
  )
}
