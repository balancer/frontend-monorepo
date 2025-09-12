import { Box, HStack, Text, ChakraProps } from '@chakra-ui/react'
import { Pool } from '../pool.types'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { ProtocolIcon } from '@repo/lib/shared/components/icons/ProtocolIcon'
import { Protocol } from '../../protocols/useProtocols'
import { isBoosted } from '../pool.helpers'
import Image from 'next/image'
import { PoolListItem } from '../pool.types'
import { usePoolsMetadata } from '../metadata/PoolsMetadataProvider'
import { CustomPopover } from '@repo/lib/shared/components/popover/CustomPopover'

type PoolTypeTagProps = {
  pool: Pool | PoolListItem
}

const tagWrapperProps = {
  alignItems: 'center',
  background: 'background.level2',
  border: '1px solid',
  borderColor: 'border.base',
  display: 'flex',
  fontWeight: 'normal',
  h: { base: '28px' },
  pr: 'sm',
  pl: 'xs',
  py: 'xs',
  rounded: 'full',
  shadow: 'sm',
  gap: 'xs',
}

function TagWrapper({ children, ...rest }: { children: React.ReactNode } & ChakraProps) {
  return (
    <Box {...tagWrapperProps} {...rest}>
      <HStack>{children}</HStack>
    </Box>
  )
}

const TEXT_PROPS = { fontSize: 'sm', variant: 'secondary' }

function getPoolTypeLabel(pool: Pool | PoolListItem) {
  const { tags, type } = pool

  if (tags?.includes('VE8020')) {
    return (
      <TagWrapper pl="6px">
        <Text {...TEXT_PROPS}>ve8020 weighted</Text>
      </TagWrapper>
    )
  }

  switch (type) {
    case GqlPoolType.CowAmm:
      return (
        <TagWrapper pl="6px">
          <ProtocolIcon protocol={Protocol.CowAmm} />
          <Text {...TEXT_PROPS}>Weighted</Text>
        </TagWrapper>
      )

    case GqlPoolType.Weighted:
      return (
        <TagWrapper pl="6px">
          <Text {...TEXT_PROPS}>Weighted</Text>
        </TagWrapper>
      )

    case GqlPoolType.Stable:
    case GqlPoolType.PhantomStable:
    case GqlPoolType.ComposableStable:
    case GqlPoolType.MetaStable:
      return (
        <TagWrapper pl="8px">
          <Text {...TEXT_PROPS}>Stable</Text>
        </TagWrapper>
      )

    case GqlPoolType.Fx:
      return (
        <TagWrapper>
          <ProtocolIcon protocol={Protocol.Xave} />
          <Text {...TEXT_PROPS}>FX</Text>
        </TagWrapper>
      )

    case GqlPoolType.LiquidityBootstrapping:
      return (
        <TagWrapper pl="6px">
          <Text {...TEXT_PROPS}>LBP</Text>
        </TagWrapper>
      )

    case GqlPoolType.Gyro:
      return (
        <TagWrapper>
          <ProtocolIcon protocol={Protocol.Gyro} />
          <Text {...TEXT_PROPS}>2-CLP</Text>
        </TagWrapper>
      )

    case GqlPoolType.Gyro3:
      return (
        <TagWrapper>
          <ProtocolIcon protocol={Protocol.Gyro} />
          <Text {...TEXT_PROPS}>3-CLP</Text>
        </TagWrapper>
      )

    case GqlPoolType.Gyroe:
      return (
        <TagWrapper>
          <ProtocolIcon protocol={Protocol.Gyro} />
          <Text {...TEXT_PROPS}>E-CLP</Text>
        </TagWrapper>
      )

    case GqlPoolType.QuantAmmWeighted:
      return (
        <CustomPopover
          bodyText="BTFs by QuantAMM dynamically adjust pool weights to capitalize on price movements. For example, a BTF pool can automatically increase its WBTC allocation when the BTF strategy thinks the value will rise faster than ETH. This allows LPs to earn both trading fees and profits from underlying asset appreciation through continuous, responsive, fully on-chain TradFi-style strategies."
          footerUrl="https://medium.com/@QuantAMM/quantamm-x-balancer-v3-046af77ddc81"
          headerText="Blockchain Traded Funds (BTFs)"
          trigger="hover"
        >
          <Box {...tagWrapperProps}>
            <ProtocolIcon protocol={Protocol.QuantAmm} />
            <Text {...TEXT_PROPS}>BTF</Text>
          </Box>
        </CustomPopover>
      )

    case GqlPoolType.Reclamm:
      return (
        <TagWrapper pl="8px">
          <Text {...TEXT_PROPS}>reCLAMM</Text>
        </TagWrapper>
      )

    default:
      return null
  }
}

export function PoolTypeTag({ pool }: PoolTypeTagProps) {
  const { getErc4626Metadata } = usePoolsMetadata()
  const erc4626Metadata = getErc4626Metadata(pool)

  return (
    <HStack>
      {getPoolTypeLabel(pool)}

      {isBoosted(pool) && erc4626Metadata.length && (
        <TagWrapper>
          {erc4626Metadata.map(metadata => (
            <Image
              alt={metadata.name}
              height={20}
              key={metadata.name}
              src={metadata.iconUrl || ''}
              width={20}
            />
          ))}
          <Text {...TEXT_PROPS}>Boosted</Text>
        </TagWrapper>
      )}
    </HStack>
  )
}
