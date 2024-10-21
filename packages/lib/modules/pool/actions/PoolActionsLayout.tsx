'use client'

import { Box, VStack, Card, useColorModeValue } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { PoolActionsNav } from './PoolActionsNav'
import { usePool } from '../PoolProvider'
import { usePoolRedirect } from '../pool.hooks'
import { PoolName } from '../PoolName'
import { NavBar } from '@repo/lib/shared/components/navs/NavBar'

type Props = PropsWithChildren

export function PoolActionsLayout({ children }: Props) {
  const { pool } = usePool()
  const { redirectToPoolPage } = usePoolRedirect(pool)

  const bg = useColorModeValue('blackAlpha.800', 'blackAlpha.700')
  const blur = useColorModeValue('blur(8px)', 'blur(5px)')

  return (
    <Box
      bg="transparent"
      left={0}
      onClick={redirectToPoolPage}
      pos="absolute"
      top={0}
      w="full"
      zIndex={100}
    >
      <VStack backdropFilter={blur} bg={bg} onClick={redirectToPoolPage} w="full" zIndex={51}>
        <NavBar disableBlur leftSlot={<PoolName color="font.light" pool={pool} />} />
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
            <PoolActionsNav />
            {children}
          </Card>
        </Box>
      </VStack>
    </Box>
  )
}
