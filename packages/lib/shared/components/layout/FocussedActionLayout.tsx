'use client';
import { Box, VStack, Card } from '@chakra-ui/react';
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode';
import { PropsWithChildren, ReactNode } from 'react'
import { useRedirect } from '@repo/lib/shared/hooks/useRedirect'
import { FocussedActionNav } from '@repo/lib/shared/components/layout/FocussedActionNav'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NavBar } from '@repo/lib/shared/components/navs/NavBar'
import { useRouter } from 'next/navigation'

type ModalLayoutProps = PropsWithChildren & {
  redirectPath: string
  leftSlot?: ReactNode
  chain: GqlChain
  closeButton?: boolean
}

export function FocussedActionLayout({
  children,
  redirectPath,
  leftSlot,
  chain,
  closeButton }: ModalLayoutProps) {
  const colorMode = useThemeColorMode()
  const bg = colorMode === 'dark' ? 'blackAlpha.700' : 'blackAlpha.800'
  const blur = colorMode === 'dark' ? 'blur(5px)' : 'blur(8px)'

  const router = useRouter()
  const { redirectToPage } = useRedirect(redirectPath)

  function goBack() {
    router.back()
  }

  return (
    <Box bg="transparent" left={0} onClick={goBack} pos="absolute" top={0} w="full" zIndex={100}>
      <VStack backdropFilter={blur} bg={bg} onClick={redirectToPage} w="full" zIndex={51}>
        <NavBar disableBlur leftSlot={leftSlot} />
        <Box pt="72px" px={['0', 'md']} w="full">
          <Card.Root
            borderBottomRadius={0}
            borderTopRadius="2xl"
            minH="calc(100vh - 80px)"
            onClick={e => e.stopPropagation()}
            position="relative"
            shadow="lg"
            variant="level1"
          >
            <FocussedActionNav
              chain={chain}
              closeButton={closeButton}
              redirectPath={redirectPath}
            />
            {children}
          </Card.Root>
        </Box>
      </VStack>
    </Box>
  );
}
