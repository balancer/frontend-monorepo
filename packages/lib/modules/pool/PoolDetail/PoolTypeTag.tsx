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

function getPoolTypeLabel(type: GqlPoolType) {
  switch (type) {
    case GqlPoolType.CowAmm:
      return (
        <>
          <ProtocolIcon protocol={Protocol.CowAmm} />
          <Text>Weighted</Text>
        </>
      )
    case GqlPoolType.Weighted:
      return 'Weighted'
    case GqlPoolType.Stable:
    case GqlPoolType.PhantomStable:
    case GqlPoolType.ComposableStable:
      return 'Stable'
    case GqlPoolType.Fx:
      return (
        <>
          <ProtocolIcon protocol={Protocol.Xave} />
          <Text color="font.primary">FX</Text>
        </>
      )
    case GqlPoolType.LiquidityBootstrapping:
      return (
        <>
          <ProtocolIcon protocol={Protocol.Fjord} />
          <Text color="font.primary">LBP</Text>
        </>
      )
    case GqlPoolType.Gyro:
      return (
        <>
          <ProtocolIcon protocol={Protocol.Gyro} />
          <Text color="font.primary">2-CLP</Text>
        </>
      )
    case GqlPoolType.Gyro3:
      return (
        <>
          <ProtocolIcon protocol={Protocol.Gyro} />
          <Text color="font.primary">3-CLP</Text>
        </>
      )
    case GqlPoolType.Gyroe:
      return (
        <>
          <ProtocolIcon protocol={Protocol.Gyro} />
          <Text color="font.primary">E-CLP</Text>
        </>
      )
    default:
      return null
  }
}

export function PoolTypeTag({ pool }: PoolChipProps) {
  const label = getPoolTypeLabel(GqlPoolType.CowAmm)

  if (!pool || !label) return null

  return <TagWrapper>{label}</TagWrapper>
}
