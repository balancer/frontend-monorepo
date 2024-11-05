import { Center } from '@chakra-ui/react'
import { BalBadge } from '@repo/lib/shared/components/badges/BalBadge'
import { CowIcon } from '@repo/lib/shared/components/icons/logos/CowIcon'
import { isCowAmmPool } from '../../pool.helpers'
import { PoolListItem } from '../../pool.types'
import { Pool } from '../../PoolProvider'

function getPoolVersionLabel(pool: PoolListItem | Pool) {
  if (isCowAmmPool(pool.type)) {
    return <CowIcon height={18} width={18} />
  } else if (pool.protocolVersion === 3) {
    return 'v3'
  } else if (pool.protocolVersion === 2) {
    return 'v2'
  } else {
    return null
  }
}

export function PoolVersionTag({
  pool,
  isSmall,
}: {
  pool: PoolListItem | Pool
  isSmall?: boolean
}) {
  const label = getPoolVersionLabel(pool)
  if (!label) return null

  const size = isSmall ? '7' : '8'

  return (
    <BalBadge
      color="font.secondary"
      fontSize="xs"
      h={size}
      p="0"
      textTransform="lowercase"
      w={size}
    >
      <Center h="full" w="full">
        {label}
      </Center>
    </BalBadge>
  )
}
