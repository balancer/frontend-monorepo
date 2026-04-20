import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'
import { BeetsPromoBanner } from '@/lib/components/promos/BeetsPromoBanner'
import { getPoolsPageData } from '@repo/lib/shared/pages/PoolsPage/poolsPage.server'
import { GetStakedSonicDataDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'

export default async function PoolsPageWrapper() {
  const client = getApolloServerClient()

  const [
    { data: stakedSonicData },
    { poolListData, protocolData, featuredPools, defaultPoolListQueryVariables },
  ] = await Promise.all([
    client.query({
      query: GetStakedSonicDataDocument,
      variables: {},
    }),
    getPoolsPageData(),
  ])

  if (!stakedSonicData) return null

  return (
    <PoolsPage
      featuredPools={featuredPools}
      initialCount={poolListData.count}
      initialPools={poolListData.pools}
      initialQueryVariables={defaultPoolListQueryVariables}
      protocolData={protocolData}
      rewardsClaimed24h={stakedSonicData.stsGetGqlStakedSonicData.rewardsClaimed24h}
    >
      {/* TODO: add <PromoBanners /> at a later date */}
      <BeetsPromoBanner />
    </PoolsPage>
  )
}
