'use client'

import { Box } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { useNavbarHeight } from '@repo/lib/shared/hooks/useNavbarHeight'

export function MarketingLayoutContent({ children }: PropsWithChildren) {
  const navbarHeight = useNavbarHeight()

  return <Box pt={`${navbarHeight}px`}>{children}</Box>
}
