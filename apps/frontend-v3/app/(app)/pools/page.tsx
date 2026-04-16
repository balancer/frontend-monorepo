import { PoolsHeroSection } from '@repo/lib/shared/pages/PoolsPage/PoolsHeroSection'
import { PoolsPoolListSection } from '@repo/lib/shared/pages/PoolsPage/PoolsPoolListSection'
import { PoolsFeaturedSection } from '@repo/lib/shared/pages/PoolsPage/PoolsFeaturedSection'
import { PoolsFeaturedPartnersSection } from '@repo/lib/shared/pages/PoolsPage/PoolsFeaturedPartnersSection'
import { PoolsBuildPromoSection } from '@repo/lib/shared/pages/PoolsPage/PoolsBuildPromoSection'
import { PromoBanners } from '@repo/lib/shared/components/promos/PromoBanners'

export default function PoolsPageWrapper() {
  return (
    <>
      <PoolsHeroSection>
        <PromoBanners />
      </PoolsHeroSection>
      <PoolsPoolListSection />
      <PoolsFeaturedSection />
      <PoolsFeaturedPartnersSection />
      <PoolsBuildPromoSection />
    </>
  )
}
