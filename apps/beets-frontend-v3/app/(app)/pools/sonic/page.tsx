import { BeetsPromoBanner } from '@/lib/components/promos/BeetsPromoBanner'
import { Box, Skeleton } from '@chakra-ui/react'
import { PoolList } from '@repo/lib/modules/pool/PoolList/PoolList'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Suspense } from 'react'

export default function PoolsPage() {
  return (
    <>
      <Box>
        <DefaultPageContainer pb={['xl', '2xl']} pt={['xl', '40px']}>
          <FadeInOnView animateOnce={false}>
            <Box>
              <BeetsPromoBanner />
            </Box>
          </FadeInOnView>
        </DefaultPageContainer>
      </Box>

      <DefaultPageContainer noVerticalPadding pb={['xl', '2xl']} pt={['lg', '54px']}>
        <FadeInOnView animateOnce={false}>
          <Suspense fallback={<Skeleton h="500px" w="full" />}>
            <PoolList fixedChains={[GqlChain.Sonic]} />
          </Suspense>
        </FadeInOnView>
      </DefaultPageContainer>
    </>
  )
}
