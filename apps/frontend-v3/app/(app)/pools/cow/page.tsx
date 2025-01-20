import { PoolList } from '@repo/lib/modules/pool/PoolList/PoolList'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { Box, Skeleton } from '@chakra-ui/react'
import { Suspense } from 'react'
import { Metadata } from 'next'
import { CowFooter } from '@repo/lib/shared/components/navs/CowFooter'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { CowHeader } from '@repo/lib/shared/components/navs/CowHeader'

export const metadata: Metadata = {
  title: `CoW AMM DeFi Liquidity Pools`,
  description: `
    CoW AMM protects LPs from LVR so they can provide liquidity
    with less risk and more return.
  `,
}

export default function PoolsPage() {
  return (
    <>
      <Box
        bg="background.level0"
        borderBottom="0.5px solid"
        borderColor="border.base"
        shadow="innerBase"
      >
        <DefaultPageContainer pb={['xl', '2xl']} pt={['xl', '40px']}>
          <FadeInOnView animateOnce={false}>
            <Box>
              <CowHeader />
            </Box>
          </FadeInOnView>
        </DefaultPageContainer>
      </Box>

      <DefaultPageContainer noVerticalPadding pb={['xl', '2xl']} pt={['lg', '54px']}>
        <FadeInOnView animateOnce={false}>
          <Suspense fallback={<Skeleton h="500px" w="full" />}>
            <PoolList fixedPoolTypes={[GqlPoolType.CowAmm]} />
          </Suspense>
        </FadeInOnView>
      </DefaultPageContainer>

      <CowFooter />
    </>
  )
}
