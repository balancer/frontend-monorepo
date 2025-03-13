import { LandingPageLayout } from '@/lib/modules/landing-page/LandingPageLayout'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { mins } from '@repo/lib/shared/utils/time'
import {
  GetProtocolStatsDocument,
  GetProtocolStatsPerChainDocument,
  GetStakedSonicDataDocument,
  GqlChain,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export default async function Home() {
  const client = getApolloServerClient()

  const variables = {
    chains: [...PROJECT_CONFIG.supportedNetworks, GqlChain.Fantom], // manually adding Fantom to the list to get the data for the landing page
  }

  const { data: protocolData } = await client.query({
    query: GetProtocolStatsDocument,
    variables,
    context: {
      fetchOptions: {
        next: { revalidate: mins(10).toSecs() },
      },
    },
  })

  const { data: protocolDataSonic } = await client.query({
    query: GetProtocolStatsPerChainDocument,
    variables: {
      chain: GqlChain.Sonic,
    },
  })

  const { data: protocolDataOptimism } = await client.query({
    query: GetProtocolStatsPerChainDocument,
    variables: {
      chain: GqlChain.Optimism,
    },
  })

  const { data: protocolDataFantom } = await client.query({
    query: GetProtocolStatsPerChainDocument,
    variables: {
      chain: GqlChain.Fantom,
    },
  })

  const { data: stakedSonicData } = await client.query({
    query: GetStakedSonicDataDocument,
    variables: {},
  })

  return (
    <LandingPageLayout
      protocolData={protocolData}
      protocolDataPerChain={[protocolDataSonic, protocolDataOptimism, protocolDataFantom]}
      stakedSonicData={stakedSonicData}
    />
  )
}
