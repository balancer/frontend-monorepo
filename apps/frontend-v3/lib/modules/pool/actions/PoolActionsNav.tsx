'use client'

import { Card, HStack, IconButton } from '@chakra-ui/react'
import Image from 'next/image'
import { usePool } from '../PoolProvider'
import { getNetworkConfig } from '@/lib/config/app.config'
import { CloseIcon } from '@chakra-ui/icons'
import { getPoolPath } from '../pool.utils'
import Link from 'next/link'

export function PoolActionsNav() {
  const { pool } = usePool()
  const networkConfig = getNetworkConfig(pool.chain)

  return (
    <HStack justify="space-between" mb="4">
      <Card
        variant="level2"
        p={{ base: 'xs', sm: 'xs', md: 'sm' }}
        width={{ base: '32px', md: '40px' }}
        h={{ base: '32px', md: '40px' }}
        shadow="sm"
      >
        <Image src={networkConfig.iconPath} width="24" height="24" alt={networkConfig.shortName} />
      </Card>

      <IconButton
        as={Link}
        href={getPoolPath(pool)}
        isRound={true}
        variant="outline"
        aria-label="Close"
        prefetch={true}
        icon={<CloseIcon />}
      />
    </HStack>
  )
}
