'use client'

import { Box } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { BaseLayout } from '../layouts/base-layout'
import { useNavbarHeight } from '@repo/lib/shared/hooks/useNavbarHeight'

export default function MarketingLayout({ children }: PropsWithChildren) {
  const navbarHeight = useNavbarHeight()

  return (
    <BaseLayout renderLzBeetsModal={false}>
      <Box pt={`${navbarHeight}px`}>{children}</Box>
    </BaseLayout>
  )
}
