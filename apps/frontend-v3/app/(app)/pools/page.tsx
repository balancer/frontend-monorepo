import { PoolList } from '@/lib/modules/pool/PoolList/PoolList'
import { DefaultPageContainer } from '@/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'

import { Box, Skeleton } from '@chakra-ui/react'
import { Suspense } from 'react'

// import { getApolloServerClient } from '@/lib/shared/services/api/apollo-server.client'
// import { getProjectConfig } from '@/lib/config/getProjectConfig'
// import { GetFeaturedPoolsDocument } from '@/lib/shared/services/api/generated/graphql'
// import { FeaturedPools } from '@/lib/modules/featured-pools/FeaturedPools'
import { CowPromoBanner } from '@/lib/shared/components/promos/CowPromoBanner'

export default async function PoolsPage() {
  // Featured pools set up
  // const { supportedNetworks } = getProjectConfig()

  // const featuredPoolsQuery = await getApolloServerClient().query({
  //   query: GetFeaturedPoolsDocument,
  //   variables: { chains: supportedNetworks },
  //   context: {
  //     fetchOptions: {
  //       next: { revalidate: 300 }, // 5 minutes
  //     },
  //   },
  // })

  // const featuredPools = featuredPoolsQuery.data.featuredPools || []

  return (
    <>
      <Box bg="background.level0" borderBottom="1px solid" borderColor="border.base">
        <DefaultPageContainer pt={['xl', '40px']} pb={['xl', '2xl']}>
          <FadeInOnView animateOnce={false}>
            <Box>
              <CowPromoBanner />
            </Box>
          </FadeInOnView>
          {/* <FadeInOnView animateOnce={false}>
            <Box pt="20" pb="4">
              <FeaturedPools featuredPools={featuredPools} />
            </Box>
          </FadeInOnView> */}
        </DefaultPageContainer>
      </Box>

      <DefaultPageContainer pt={['lg', '54px']} pb={['xl', '2xl']} noVerticalPadding>
        <FadeInOnView animateOnce={false}>
          <Suspense fallback={<Skeleton w="full" h="500px" />}>
            <PoolList />
          </Suspense>
        </FadeInOnView>
      </DefaultPageContainer>
    </>
  )
}
