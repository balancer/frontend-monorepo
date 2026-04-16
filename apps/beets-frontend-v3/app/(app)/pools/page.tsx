import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'
import { BeetsPromoBanner } from '@/lib/components/promos/BeetsPromoBanner'
import { GetStakedSonicDataDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { PoolListWithInitialData } from '@repo/lib/modules/pool/PoolList/PoolListWithInitialData'
import { Suspense } from 'react'
import { Skeleton } from '@chakra-ui/react'

export const revalidate = 60

export default async function PoolsPageWrapper() {
  const client = getApolloServerClient()

  const { data: stakedSonicData } = await client.query({
    query: GetStakedSonicDataDocument,
    variables: {},
  })

  if (!stakedSonicData) return null

  return (
    <PoolsPage
      rewardsClaimed24h={stakedSonicData.stsGetGqlStakedSonicData.rewardsClaimed24h}
      poolListSlot={
        <Suspense fallback={<Skeleton h="500px" w="full" />}>
          <PoolListWithInitialData />
        </Suspense>
      }
    >
      {/* TODO: add <PromoBanners /> at a later date */}
      <BeetsPromoBanner />
    </PoolsPage>
  )
}
