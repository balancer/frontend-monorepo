import { Box, HStack, Text } from '@chakra-ui/react'
import { Pool } from '../pool.types'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { ProtocolIcon } from '@repo/lib/shared/components/icons/ProtocolIcon'
import { Protocol } from '../../protocols/useProtocols'
import { isBoosted } from '../pool.helpers'
import Image from 'next/image'
import { PoolListItem } from '../pool.types'
import { Erc4626Metadata } from '../metadata/getErc4626Metadata'
import { usePoolsMetadata } from '../metadata/PoolsMetadataProvider'

type PoolTypeTagProps = {
  pool: Pool | PoolListItem
}

function TagWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box
      alignItems="center"
      background="background.level2"
      border="1px solid"
      borderColor="border.base"
      display="flex"
      fontWeight="normal"
      h={{ base: '28px' }}
      px="sm"
      py="xs"
      rounded="full"
      shadow="sm"
    >
      <HStack>{children}</HStack>
    </Box>
  )
}

function getPoolTypeLabel(pool: Pool | PoolListItem, erc4626Metadata: Erc4626Metadata[]) {
  const { tags, type } = pool
  const textProps = { fontSize: 'sm', variant: 'secondary' }

  if (isBoosted(pool) && erc4626Metadata.length) {
    return (
      <>
        {erc4626Metadata.map(metadata => (
          <Image
            alt={metadata.name}
            height={20}
            key={metadata.name}
            src={metadata.iconUrl || ''}
            width={20}
          />
        ))}
        <Text {...textProps}>Boosted</Text>
      </>
    )
  }

  if (tags?.includes('VE8020')) {
    return <Text {...textProps}>ve8020 weighted</Text>
  }

  switch (type) {
    case GqlPoolType.CowAmm:
      return (
        <>
          <ProtocolIcon protocol={Protocol.CowAmm} />
          <Text {...textProps}>Weighted</Text>
        </>
      )

    case GqlPoolType.Weighted:
      return <Text {...textProps}>Weighted</Text>

    case GqlPoolType.Stable:
    case GqlPoolType.PhantomStable:
    case GqlPoolType.ComposableStable:
    case GqlPoolType.MetaStable:
      return <Text {...textProps}>Stable</Text>

    case GqlPoolType.Fx:
      return (
        <>
          <ProtocolIcon protocol={Protocol.Xave} />
          <Text {...textProps}>FX</Text>
        </>
      )

    case GqlPoolType.LiquidityBootstrapping:
      return (
        <>
          <ProtocolIcon protocol={Protocol.Fjord} />
          <Text {...textProps}>LBP</Text>
        </>
      )

    case GqlPoolType.Gyro:
      return (
        <>
          <ProtocolIcon protocol={Protocol.Gyro} />
          <Text {...textProps}>2-CLP</Text>
        </>
      )

    case GqlPoolType.Gyro3:
      return (
        <>
          <ProtocolIcon protocol={Protocol.Gyro} />
          <Text {...textProps}>3-CLP</Text>
        </>
      )

    case GqlPoolType.Gyroe:
      return (
        <>
          <ProtocolIcon protocol={Protocol.Gyro} />
          <Text {...textProps}>E-CLP</Text>
        </>
      )

    case GqlPoolType.Reclamm:
      return <Text {...textProps}>Reclamm</Text>

    default:
      return null
  }
}

export function PoolTypeTag({ pool }: PoolTypeTagProps) {
  const { getErc4626Metadata } = usePoolsMetadata()
  const erc4626Metadata = getErc4626Metadata(pool)

  const label = getPoolTypeLabel(pool, erc4626Metadata)

  return <TagWrapper>{label}</TagWrapper>
}
