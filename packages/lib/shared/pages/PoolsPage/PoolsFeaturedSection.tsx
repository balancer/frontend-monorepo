'use client'

import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { Box, Skeleton } from '@chakra-ui/react'
import { useQuery } from '@apollo/client/react'
import { GetFeaturedPoolsDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { FeaturedPools } from '@repo/lib/modules/featured-pools/FeaturedPools'
import { isBalancer } from '@repo/lib/config/getProjectConfig'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function PoolsFeaturedSection() {
  const { supportedNetworks } = PROJECT_CONFIG

  const { data: featuredPoolsData, loading: featuredPoolsLoading } = useQuery(
    GetFeaturedPoolsDocument,
    {
      variables: { chains: supportedNetworks },
      fetchPolicy: 'cache-and-network',
    }
  )

  const featuredPools = featuredPoolsData?.featuredPools || []

  if (!isBalancer) return null

  if (!featuredPoolsLoading && featuredPools.length === 0) return null

  return (
    <DefaultPageContainer mb="lg" py="0" rounded="2xl">
      <FadeInOnView animateOnce={false}>
        <Box>
          {!featuredPoolsLoading && featuredPools.length > 0 && (
            <FeaturedPools featuredPools={featuredPools} />
          )}
          {featuredPoolsLoading && <Skeleton height="327px" width="100%" />}
        </Box>
      </FadeInOnView>
    </DefaultPageContainer>
  )
}
