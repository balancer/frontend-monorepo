import { PoolList } from '@repo/lib/modules/pool/PoolList/PoolList'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { Box, Skeleton } from '@chakra-ui/react'
import { Suspense } from 'react'
// import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
// import { getProjectConfig } from '@repo/lib/config/getProjectConfig'
// import { GetFeaturedPoolsDocument } from '@repo/lib/shared/services/api/generated/graphql'
// import { FeaturedPools } from '@repo/lib/modules/featured-pools/FeaturedPools'
import { CowPromoBanner } from '@repo/lib/shared/components/promos/CowPromoBanner'
import { PoolListDisplayType } from '@repo/lib/modules/pool/pool.types'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'

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
        <DefaultPageContainer pb={['xl', '2xl']} pt={['xl', '40px']}>
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
      <DefaultPageContainer noVerticalPadding pb={['xl', '2xl']} pt={['lg', '54px']}>
        <FadeInOnView animateOnce={false}>
          <Suspense fallback={<Skeleton h="500px" w="full" />}>
            <PoolList
              displayType={PoolListDisplayType.Name}
              hidePoolTags={['VE8020']}
              hidePoolTypes={[
                GqlPoolType.LiquidityBootstrapping,
                GqlPoolType.Gyro,
                GqlPoolType.CowAmm,
                GqlPoolType.Fx,
              ]}
              hideProtocolVersion={['cow']}
            />
          </Suspense>
        </FadeInOnView>
      </DefaultPageContainer>
    </>
  )
}
