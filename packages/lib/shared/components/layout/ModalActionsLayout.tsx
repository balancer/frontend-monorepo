'use client'

import { Box, VStack, Card, useColorModeValue } from '@chakra-ui/react'
import { PropsWithChildren, ReactNode } from 'react'
import { useRedirect } from '@repo/lib/shared/hooks/useRedirect'
import { ModalActionsNav } from '@repo/lib/shared/components/layout/ModalActionsNav'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NavBar } from '@repo/lib/shared/components/navs/NavBar'

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
      bg="transparent"
      left={0}
      onClick={redirectToPage}
      pos="absolute"
      top={0}
      w="full"
      zIndex={100}
    >
      <VStack backdropFilter={blur} bg={bg} onClick={redirectToPage} w="full" zIndex={51}>
        <NavBar disableBlur leftSlot={leftSlot} />
        <Box pt="72px" px={['0', 'md']} w="full">
          <Card
            borderBottomRadius={0}
            borderTopRadius="2xl"
            minH="calc(100vh - 80px)"
            onClick={e => e.stopPropagation()}
            position="relative"
            shadow="lg"
            variant="level1"
          >
            <ModalActionsNav chain={chain} redirectPath={redirectPath} />
            {children}
          </Card>
        </Box>
      </VStack>
    </Box>
  )
}
