import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'
import { BeetsPromoBanner } from '@/lib/components/promos/BeetsPromoBanner'
import {
  GetProtocolStatsDocument,
  GetStakedSonicDataDocument,
  GqlChain,
} from '@repo/lib/shared/services/api/generated/graphql'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { mins } from '@repo/lib/shared/utils/time'

export default async function PoolsPageWrapper() {
  const client = getApolloServerClient()

  const variables = {
    chains: [...PROJECT_CONFIG.supportedNetworks, GqlChain.Fantom], // manually adding Fantom to the list to get the data for the landing page
  }

  const { data: stakedSonicData } = await client.query({
    query: GetStakedSonicDataDocument,
    variables: {},
  })

  const { data: protocolData } = await client.query({
    query: GetProtocolStatsDocument,
    variables,
    context: {
      fetchOptions: {
        next: { revalidate: mins(10).toSecs() },
      },
    },
  })

  // we're on the server here so can't use 'bn'
  const additionalFees = (
    parseFloat(stakedSonicData.stsGetGqlStakedSonicData.rewardsClaimed24h) +
    parseFloat(protocolData.protocolMetricsAggregated.yieldCapture24h)
  ).toString()

  return (
    <PoolsPage additionalFees={additionalFees}>
      <BeetsPromoBanner />
    </PoolsPage>
  )
}
