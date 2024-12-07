import { PoolListItem } from '@repo/lib/modules/pool/pool.types'
import { useErc4626Metadata } from '@repo/lib/modules/erc4626/Erc4626MetadataProvider'
import { HStack, Text } from '@chakra-ui/react'
import { PoolVersionTag } from '@repo/lib/modules/pool/PoolList/PoolListTable/PoolVersionTag'
import { isBoosted } from '@repo/lib/modules/pool/pool.helpers'
import { getPoolTypeLabel } from '@repo/lib/modules/pool/pool.utils'
import Image from 'next/image'
import { Pool } from '@repo/lib/modules/pool/PoolProvider'
import { PoolHookTag } from '@repo/lib/modules/pool/PoolDetail/PoolHookTag'

interface Props {
  pool: PoolListItem | Pool
}

export function PollListTableDetailsCell({ pool }: Props) {
  const { getErc4626Metadata } = useErc4626Metadata()

  const erc4626Metadata = getErc4626Metadata(pool)

  return (
    <HStack>
      <PoolVersionTag isSmall pool={pool} />
      <Text fontWeight="medium" textAlign="left" textTransform="capitalize">
        {isBoosted(pool) ? 'Boosted' : getPoolTypeLabel(pool.type)}
      </Text>
      {erc4626Metadata.map(metadata => (
        <Image
          alt={metadata.name}
          height={20}
          key={metadata.name}
          src={metadata.iconUrl || ''}
          width={20}
        />
      ))}
      <PoolHookTag pool={pool} size="sm" />
    </HStack>
  )
}
