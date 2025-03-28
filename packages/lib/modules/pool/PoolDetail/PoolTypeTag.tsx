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
  px: 'sm',
  py: 'xs',
  rounded: 'full',
  shadow: 'sm',
  gap: 'xs',
}

function TagWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box {...tagWrapperProps}>
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
        <TagWrapper>
          <ProtocolIcon protocol={Protocol.CowAmm} />
          <Text {...textProps}>Weighted</Text>
        </TagWrapper>
      )

    case GqlPoolType.Weighted:
      return (
        <TagWrapper>
          <Text {...textProps}>Weighted</Text>
        </TagWrapper>
      )

    case GqlPoolType.Stable:
    case GqlPoolType.PhantomStable:
    case GqlPoolType.ComposableStable:
    case GqlPoolType.MetaStable:
      return (
        <TagWrapper>
          <Text {...textProps}>Stable</Text>
        </TagWrapper>
      )

    case GqlPoolType.Fx:
      return (
        <TagWrapper>
          <ProtocolIcon protocol={Protocol.Xave} />
          <Text {...textProps}>FX</Text>
        </TagWrapper>
      )

    case GqlPoolType.LiquidityBootstrapping:
      return (
        <TagWrapper>
          <ProtocolIcon protocol={Protocol.Fjord} />
          <Text {...textProps}>LBP</Text>
        </TagWrapper>
      )

    case GqlPoolType.Gyro:
      return (
        <TagWrapper>
          <ProtocolIcon protocol={Protocol.Gyro} />
          <Text {...textProps}>2-CLP</Text>
        </TagWrapper>
      )

    case GqlPoolType.Gyro3:
      return (
        <TagWrapper>
          <ProtocolIcon protocol={Protocol.Gyro} />
          <Text {...textProps}>3-CLP</Text>
        </TagWrapper>
      )

    case GqlPoolType.Gyroe:
      return (
        <TagWrapper>
          <ProtocolIcon protocol={Protocol.Gyro} />
          <Text {...textProps}>E-CLP</Text>
        </TagWrapper>
      )

    case GqlPoolType.QuantAmmWeighted:
      return (
        <CustomPopover
          bodyText="BTFs by QuantAMM dynamically adjust pool weights to capitalize on price movements. For example, a BTF pool can automatically increase its WBTC allocation when its value rises faster than ETH. This allows LPs to earn both trading fees and profits from underlying asset appreciation through continuous, responsive, fully on-chain TradFi-style strategies."
          footerUrl="https://medium.com/@QuantAMM/quantamm-x-balancer-v3-046af77ddc81"
          headerText="Blockchain Traded Funds (BFTs)"
          trigger="hover"
        >
          <Box {...tagWrapperProps}>
            <ProtocolIcon protocol={Protocol.QuantAmm} />
            <Text {...textProps}>BTF</Text>
          </Box>
        </CustomPopover>
      )

    default:
      return null
  }
}

export function PoolTypeTag({ pool }: PoolTypeTagProps) {
  const { getErc4626Metadata } = usePoolsMetadata()
  const erc4626Metadata = getErc4626Metadata(pool)

  return getPoolTypeLabel(pool, erc4626Metadata)
}
