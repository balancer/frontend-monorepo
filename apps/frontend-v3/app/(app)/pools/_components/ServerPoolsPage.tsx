import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'
import { PromoBanners } from '@repo/lib/shared/components/promos/PromoBanners'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import {
  GetFeaturedPoolsDocument,
  GetProtocolStatsDocument,
  GqlChain,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

/**
 * Server component that fetches initial data for the pools page.
 * This reduces TTFB and allows the page to render immediately with data.
 */
export default async function ServerPoolsPage() {
  const client = getApolloServerClient()
  const { supportedNetworks } = PROJECT_CONFIG

  // Fetch data server-side in parallel
  const [featuredPoolsResult, protocolStatsResult] = await Promise.all([
    client.query({
      query: GetFeaturedPoolsDocument,
      variables: { chains: supportedNetworks as GqlChain[] },
    }),
    client.query({
      query: GetProtocolStatsDocument,
      variables: { chains: supportedNetworks as GqlChain[] },
    }),
  ])

  return (
    <PoolsPage
      initialFeaturedPools={featuredPoolsResult.data?.featuredPools}
      initialProtocolStats={protocolStatsResult.data?.protocolMetricsAggregated}
    >
      <PromoBanners />
    </PoolsPage>
  )
}
