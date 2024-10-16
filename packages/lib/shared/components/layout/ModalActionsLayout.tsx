'use client'

import { Navbar } from '@repo/lib/shared/components/navs/Navbar'
import { Box, VStack, Card, useColorModeValue } from '@chakra-ui/react'
import { PropsWithChildren, ReactNode } from 'react'
import { useRedirect } from '@repo/lib/shared/hooks/useRedirect'
import { ModalActionsNav } from '@repo/lib/shared/components/layout/ModalActionsNav'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

type ModalLayoutProps = PropsWithChildren & {
  redirectPath: string
  leftSlot?: ReactNode
  chain: GqlChain
}

export function ModalActionsLayout({ children, redirectPath, leftSlot, chain }: ModalLayoutProps) {
  const bg = useColorModeValue('blackAlpha.800', 'blackAlpha.700')
  const blur = useColorModeValue('blur(8px)', 'blur(5px)')

  const { redirectToPage } = useRedirect(redirectPath)

  return (
    <Box
      pos="absolute"
      top={0}
      left={0}
      w="full"
      bg="transparent"
      zIndex={100}
      onClick={redirectToPage}
    >
      <VStack w="full" bg={bg} backdropFilter={blur} zIndex={51} onClick={redirectToPage}>
        <Navbar leftSlot={leftSlot} disableBlur />
        <Box w="full" px={['0', 'md']} pt="72px">
          <Card
            position="relative"
            variant="level1"
            shadow="lg"
            borderBottomRadius={0}
            borderTopRadius="2xl"
            minH="calc(100vh - 80px)"
            onClick={e => e.stopPropagation()}
          >
            <ModalActionsNav redirectPath={redirectPath} chain={chain} />
            {children}
          </Card>
        </Box>
      </VStack>
    </Box>
  )
}
