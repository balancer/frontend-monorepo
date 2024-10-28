import { Box, HStack, Text } from '@chakra-ui/react'
import { Pool } from '../PoolProvider'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { ProtocolIcon } from '@repo/lib/shared/components/icons/ProtocolIcon'
import { Protocol } from '../../protocols/useProtocols'

type PoolChipProps = {
  pool: Pool
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

// TODO: add boosted tag
function getPoolTypeLabel(pool: Pool) {
  const { tags, type } = pool
  const textProps = { fontSize: 'sm', variant: 'secondary' }

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

    default:
      return null
  }
}

export function PoolTypeTag({ pool }: PoolChipProps) {
  const label = getPoolTypeLabel(pool)

  return <TagWrapper>{label}</TagWrapper>
}
