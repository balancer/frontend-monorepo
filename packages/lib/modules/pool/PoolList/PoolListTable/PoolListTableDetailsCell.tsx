import { PoolCore, PoolListItem } from '@repo/lib/modules/pool/pool.types'
import { HStack, Text } from '@chakra-ui/react'
import { PoolVersionTag } from '@repo/lib/modules/pool/PoolList/PoolListTable/PoolVersionTag'
import {
  isBoosted,
  isLiquidityBootstrapping,
  isQuantAmmPool,
  isV3Pool,
} from '@repo/lib/modules/pool/pool.helpers'
import { getPoolTypeLabel } from '@repo/lib/modules/pool/pool.utils'
import Image from 'next/image'
import { PoolHookTag } from '@repo/lib/modules/pool/PoolDetail/PoolHookTag'
import { usePoolsMetadata } from '../../metadata/PoolsMetadataProvider'
import { Erc4626Metadata } from '../../metadata/getErc4626Metadata'
import { Protocol } from '@repo/lib/modules/protocols/useProtocols'
import { ProtocolIcon } from '@repo/lib/shared/components/icons/ProtocolIcon'
import { LbpPoolListInfo } from '../../LbpDetail/LbpPoolListInfo'
import { isDev, isStaging } from '@repo/lib/config/app.config'

function getPoolDisplayTypeLabel(pool: PoolCore, erc4626Metadata: Erc4626Metadata[]) {
  if (isBoosted(pool)) {
    return (
      <>
        <Text fontWeight="medium" textAlign="left">
          Boosted
        </Text>
        <HStack gap="0.375rem">
          {erc4626Metadata.map(metadata => (
            <Image
              alt={metadata.name}
              height={20}
              key={metadata.name}
              src={metadata.iconUrl || ''}
              width={20}
            />
          ))}
        </HStack>
      </>
    )
  }

  if (isQuantAmmPool(pool.type)) {
    return (
      <>
        <Text fontWeight="medium" textAlign="left">
          BTF
        </Text>
        <ProtocolIcon protocol={Protocol.QuantAmm} />
      </>
    )
  }

  return (
    <Text fontWeight="medium" textAlign="left">
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
      {isV3Pool(pool) && isLiquidityBootstrapping(pool.type) && (isDev || isStaging) && (
        <LbpPoolListInfo pool={pool as PoolListItem} />
      )}
    </HStack>
  )
}
