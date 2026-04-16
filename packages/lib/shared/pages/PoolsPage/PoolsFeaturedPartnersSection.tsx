'use client'

import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { FeaturedPartners } from './FeaturedPartners'

export function PoolsFeaturedPartnersSection() {
  return (
    <DefaultPageContainer mb="0" py="0" rounded="2xl">
      <FadeInOnView animateOnce={false}>
        <FeaturedPartners />
      </FadeInOnView>
    </DefaultPageContainer>
  )
}
