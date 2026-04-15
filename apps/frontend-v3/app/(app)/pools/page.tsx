import { Suspense } from 'react'
import { PoolsHeroSection } from './_components/PoolsHeroSection'
import { PromoBanners } from '@repo/lib/shared/components/promos/PromoBanners'
import { DefaultPoolListSection } from './_components/DefaultPoolListSection'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { Skeleton } from '@chakra-ui/react'
import { FeaturedPartners } from '@repo/lib/shared/pages/PoolsPage/FeaturedPartners'
import { BuildPromo } from '@repo/lib/shared/pages/PoolsPage/BuildPromo'
import { isBalancer } from '@repo/lib/config/getProjectConfig'
import { FeaturedPoolsSection } from './_components/FeaturedPoolsSection'

export default async function PoolsPageWrapper() {
  return (
    <>
      <PoolsHeroSection>
        <PromoBanners />
      </PoolsHeroSection>

      <DefaultPageContainer
        noVerticalPadding
        pb="xl"
        pr={{ base: '0 !important', xl: 'md !important' }}
        pt={['lg', '54px']}
      >
        <Suspense fallback={<Skeleton h="500px" w="full" />}>
          <DefaultPoolListSection />
        </Suspense>
      </DefaultPageContainer>

      {isBalancer && (
        <Suspense fallback={<Skeleton h="327px" w="100%" />}>
          <FeaturedPoolsSection />
        </Suspense>
      )}

      <DefaultPageContainer mb="lg" py="0" rounded="2xl">
        <FeaturedPartners />
      </DefaultPageContainer>

      {isBalancer && (
        <DefaultPageContainer mb="0" py="0" rounded="2xl">
          <BuildPromo />
        </DefaultPageContainer>
      )}
    </>
  )
}
