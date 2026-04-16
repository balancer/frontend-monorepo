'use client'

import { PoolList } from '@repo/lib/modules/pool/PoolList/PoolList'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { Skeleton } from '@chakra-ui/react'
import { Suspense } from 'react'

export function PoolsPoolListSection() {
  return (
    <DefaultPageContainer
      noVerticalPadding
      pb="xl"
      pr={{ base: '0 !important', xl: 'md !important' }}
      pt={['lg', '54px']}
    >
      <FadeInOnView animateOnce={false}>
        <Suspense fallback={<Skeleton h="500px" w="full" />}>
          <PoolList />
        </Suspense>
      </FadeInOnView>
    </DefaultPageContainer>
  )
}
