import { PoolCore, PoolListItem } from '@repo/lib/modules/pool/pool.types'
import { Box, HStack, Text } from '@chakra-ui/react'
import { PoolVersionTag } from '@repo/lib/modules/pool/PoolList/PoolListTable/PoolVersionTag'
import {
  isBoosted,
  isGyro,
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
  const hasIconTags = isGyro(pool.type) || isQuantAmmPool(pool.type) || isBoosted(pool)

  return (
    <HStack>
      <Text fontWeight="medium" textAlign="left">
        {getPoolTypeLabel(pool.type)}
      </Text>

      {hasIconTags && (
        <HStack
          background="background.level2"
          border="1px solid"
          borderColor="border.base"
          gap="0.150rem"
          p="1px"
          rounded="full"
          shadow="sm"
        >
          {isGyro(pool.type) && <ProtocolIcon protocol={Protocol.Gyro} />}
          {isQuantAmmPool(pool.type) && <ProtocolIcon protocol={Protocol.QuantAmm} />}

          {isBoosted(pool) && (
            <>
              {(isGyro(pool.type) || isQuantAmmPool(pool.type)) && (
                <Box
                  borderColor="border.base"
                  borderRight="1px solid"
                  height="3"
                  marginLeft="1"
                  marginRight="1"
                  width="1px"
                />
              )}

              <Image alt="Boosted" height={20} src="/images/icons/boosted.svg" width={20} />

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
          )}
        </HStack>
      )}
    </HStack>
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
