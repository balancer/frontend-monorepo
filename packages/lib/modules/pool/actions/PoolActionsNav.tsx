'use client'

import { Card, HStack, IconButton } from '@chakra-ui/react'
import Image from 'next/image'
import { usePool } from '../PoolProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { CloseIcon } from '@chakra-ui/icons'
import { getPoolPath } from '../pool.utils'
import Link from 'next/link'

export function PoolActionsNav() {
  const { pool } = usePool()
  const networkConfig = getNetworkConfig(pool.chain)

  return (
    <HStack justify="space-between" mb="4">
      <Card
        h={{ base: '32px', md: '40px' }}
        p={{ base: 'xs', sm: 'xs', md: 'sm' }}
        shadow="sm"
        variant="level2"
        width={{ base: '32px', md: '40px' }}
      >
        <Image alt={networkConfig.shortName} height="24" src={networkConfig.iconPath} width="24" />
      </Card>

      <IconButton
        aria-label="Close"
        as={Link}
        href={getPoolPath(pool)}
        icon={<CloseIcon />}
        isRound
        prefetch
        variant="outline"
      />
    </HStack>
  )
}
