import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { GetFeaturedPoolsDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { FeaturedPools } from '@repo/lib/modules/featured-pools/FeaturedPools'
import { Box, Card } from '@chakra-ui/react'

export async function FeaturedPoolsSection() {
  const { data: featuredPoolsData } = await getApolloServerClient().query({
    query: GetFeaturedPoolsDocument,
    variables: { chains: PROJECT_CONFIG.supportedNetworks },
    context: {
      fetchOptions: {
        next: { revalidate: 60 },
      },
    },
  })

  const featuredPools = featuredPoolsData?.featuredPools || []

  if (featuredPools.length === 0) return null

  return (
    <Card mb="lg" py="0" rounded="2xl">
      <Box>
        <FeaturedPools featuredPools={featuredPools} />
      </Box>
    </Card>
  )
}
