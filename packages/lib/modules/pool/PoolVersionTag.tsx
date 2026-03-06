'use client'

import { BalBadge } from '@repo/lib/shared/components/badges/BalBadge'
import { isCowAmmPool } from './pool.helpers'
import { PoolListItem } from './pool.types'
import { Center } from '@chakra-ui/react'
import { CowIcon } from '@repo/lib/shared/components/icons/logos/CowIcon'
import { Pool } from './pool.types'

export function PoolVersionTag({ pool, size = 8 }: { pool: PoolListItem | Pool; size?: number }) {
  if (isCowAmmPool(pool.type)) {
    return (
      <BalBadge
        color="font.secondary"
        fontSize="xs"
        h={size}
        p={0}
        textTransform="lowercase"
        w={size}
      >
        <Center h="full" w="full">
          <CowIcon size={18} />
        </Center>
      </BalBadge>
    )
  } else if (pool.protocolVersion === 3) {
    return (
      <BalBadge
        color="font.secondary"
        fontSize="xs"
        h={size}
        p={0}
        textTransform="lowercase"
        w={size}
      >
        <Center h="full" w="full">
          v3
        </Center>
      </BalBadge>
    )
  } else if (pool.protocolVersion === 2) {
    return (
      <BalBadge
        color="font.secondary"
        fontSize="xs"
        h={size}
        p={0}
        textTransform="lowercase"
        w={size}
      >
        <Center h="full" w="full">
          v2
        </Center>
      </BalBadge>
    )
  }
  return null
}
