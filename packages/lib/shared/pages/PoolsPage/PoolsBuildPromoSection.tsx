'use client'

import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { BuildPromo } from './BuildPromo'
import { isBalancer } from '@repo/lib/config/getProjectConfig'

export function PoolsBuildPromoSection() {
  if (!isBalancer) return null

  return (
    <DefaultPageContainer mb="0" py="0" rounded="2xl">
      <FadeInOnView animateOnce={false}>
        <BuildPromo />
      </FadeInOnView>
    </DefaultPageContainer>
  )
}
