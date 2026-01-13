import { Box } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { BaseLayout } from '../layouts/base-layout'

export default function MarketingLayout({ children }: PropsWithChildren) {
  return (
    <BaseLayout>
      <Box>{children}</Box>
    </BaseLayout>
  )
}
