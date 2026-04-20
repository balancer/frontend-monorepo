import 'server-only'

import { PROJECT_CONFIG, isBalancer } from '@repo/lib/config/getProjectConfig'
import { getDefaultPoolListQueryVariables } from '@repo/lib/modules/pool/PoolList/defaultPoolListQuery'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import {
  GetFeaturedPoolsDocument,
  GetFeaturedPoolsQuery,
  GetPoolsDocument,
  GetProtocolStatsDocument,
} from '@repo/lib/shared/services/api/generated/graphql'
import { mins } from '@repo/lib/shared/utils/time'

export async function getPoolsPageData() {
  const client = getApolloServerClient()
  const defaultPoolListQueryVariables = getDefaultPoolListQueryVariables()

  const poolListPromise = client.query({
    query: GetPoolsDocument,
    variables: defaultPoolListQueryVariables,
    context: {
      fetchOptions: {
        next: { revalidate: mins(1).toSecs() },
      },
    },
  })

  const protocolStatsPromise = client.query({
    query: GetProtocolStatsDocument,
    variables: {
      chains: PROJECT_CONFIG.networksForProtocolStats || PROJECT_CONFIG.supportedNetworks,
    },
    context: {
      fetchOptions: {
        next: { revalidate: mins(1).toSecs() },
      },
    },
  })

  const featuredPoolsPromise: Promise<{ data?: GetFeaturedPoolsQuery }> = isBalancer
    ? client.query({
        query: GetFeaturedPoolsDocument,
        variables: { chains: PROJECT_CONFIG.supportedNetworks },
        context: {
          fetchOptions: {
            next: { revalidate: mins(10).toSecs() },
          },
        },
      })
    : Promise.resolve({
        data: {
          __typename: 'Query',
          featuredPools: [],
        },
      })

  const [{ data: poolListData }, { data: protocolData }, { data: featuredPoolsData }] =
    await Promise.all([poolListPromise, protocolStatsPromise, featuredPoolsPromise])

  if (!poolListData) {
    throw new Error('Failed to fetch default pool list data for /pools')
  }

  if (!protocolData) {
    throw new Error('Failed to fetch protocol stats for /pools')
  }

  return {
    defaultPoolListQueryVariables,
    featuredPools: featuredPoolsData?.featuredPools || [],
    poolListData,
    protocolData,
  }
}
