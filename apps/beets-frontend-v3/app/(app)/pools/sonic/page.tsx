import { BeetsPromoBanner } from '@/lib/components/promos/BeetsPromoBanner'
import { Box, Skeleton } from '@chakra-ui/react'
import { PoolListDisplayType } from '@repo/lib/modules/pool/pool.types'
import { PoolList } from '@repo/lib/modules/pool/PoolList/PoolList'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
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
            <PoolList
              displayType={PoolListDisplayType.Name}
              fixedChains={[GqlChain.Sonic]}
              hidePoolTags={['VE8020', 'BOOSTED']}
              hidePoolTypes={[
                GqlPoolType.LiquidityBootstrapping,
                GqlPoolType.CowAmm,
                GqlPoolType.Fx,
              ]}
              hideProtocolVersion={['cow', 'v3']}
            />
          </Suspense>
        </FadeInOnView>
      </DefaultPageContainer>
    </>
  )
}
