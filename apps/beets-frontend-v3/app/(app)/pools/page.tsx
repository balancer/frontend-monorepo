import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'
import { BeetsPromoBanner } from '@/lib/components/promos/BeetsPromoBanner'
import { GetStakedSonicDataDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'

export default async function PoolsPageWrapper() {
  const client = getApolloServerClient()

  const { data: stakedSonicData } = await client.query({
    query: GetStakedSonicDataDocument,
    variables: {},
  })

  return (
    <PoolsPage rewardsClaimed24h={stakedSonicData.stsGetGqlStakedSonicData.rewardsClaimed24h}>
      {/* TODO: add <PromoBanners /> at a later date */}
      <BeetsPromoBanner />
    </PoolsPage>
  )
}
