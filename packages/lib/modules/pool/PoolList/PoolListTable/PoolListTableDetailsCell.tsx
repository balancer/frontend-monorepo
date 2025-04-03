import { PoolCore } from '@repo/lib/modules/pool/pool.types'
import { HStack, Text } from '@chakra-ui/react'
import { PoolVersionTag } from '@repo/lib/modules/pool/PoolList/PoolListTable/PoolVersionTag'
import { isBoosted, isQuantAmmPool } from '@repo/lib/modules/pool/pool.helpers'
import { getPoolTypeLabel } from '@repo/lib/modules/pool/pool.utils'
import Image from 'next/image'
import { PoolHookTag } from '@repo/lib/modules/pool/PoolDetail/PoolHookTag'
import { usePoolsMetadata } from '../../metadata/PoolsMetadataProvider'
import { Erc4626Metadata } from '../../metadata/getErc4626Metadata'
import { Protocol } from '@repo/lib/modules/protocols/useProtocols'
import { ProtocolIcon } from '@repo/lib/shared/components/icons/ProtocolIcon'

function getPoolDisplayTypeLabel(pool: PoolCore, erc4626Metadata: Erc4626Metadata[]) {
  if (isBoosted(pool)) {
    return (
      <>
        <Text fontWeight="medium" textAlign="left" textTransform="capitalize">
          Boosted
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
      </>
    )
  }

  if (isQuantAmmPool(pool.type)) {
    return (
      <>
        <Text fontWeight="medium" textAlign="left" textTransform="capitalize">
          BTF
        </Text>
        <ProtocolIcon protocol={Protocol.QuantAmm} />
      </>
    )
  }

  return (
    <Text fontWeight="medium" textAlign="left" textTransform="capitalize">
      {getPoolTypeLabel(pool.type)}
    </Text>
  )
}

interface Props {
  pool: PoolCore
}

export function PoolListTableDetailsCell({ pool }: Props) {
  const { getErc4626Metadata } = usePoolsMetadata()

  const erc4626Metadata = getErc4626Metadata(pool)

  return (
    <HStack>
      <PoolVersionTag isSmall pool={pool} />
      {getPoolDisplayTypeLabel(pool, erc4626Metadata)}
      <PoolHookTag onlyShowIcon pool={pool} />
    </HStack>
  )
}
