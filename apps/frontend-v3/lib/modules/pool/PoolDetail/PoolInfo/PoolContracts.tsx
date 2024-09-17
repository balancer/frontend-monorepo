'use client'

import { abbreviateAddress } from '@/lib/shared/utils/addresses'
import {
  Box,
  Card,
  CardProps,
  Grid,
  GridItem,
  HStack,
  Heading,
  Icon,
  Link,
  Divider,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { usePool } from '../../PoolProvider'
import { ArrowUpRight } from 'react-feather'
import { useMemo } from 'react'
import { GqlPriceRateProviderData, GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { Address, zeroAddress } from 'viem'
import { useTokens } from '@/lib/modules/tokens/TokensProvider'
import { TokenIcon } from '@/lib/modules/tokens/TokenIcon'
import { AlertTriangle, XCircle } from 'react-feather'
import Image from 'next/image'
import { RateProviderInfoPopOver } from './RateProviderInfo'
import { getBlockExplorerAddressUrl } from '@/lib/shared/hooks/useBlockExplorer'
import { getRateProviderWarnings } from '@/lib/modules/pool/pool.helpers'

type RateProvider = {
  tokenAddress: Address
  rateProviderAddress: Address
  priceRateProviderData: GqlPriceRateProviderData | null
}

function getRateProviderIcon(data: GqlPriceRateProviderData | null, token: GqlToken) {
  let icon
  let level

  const warnings = getRateProviderWarnings(data?.warnings || [])

  if (!data) {
    icon = <Icon as={AlertTriangle} color="font.warning" size={16} cursor="pointer" />
    level = 1
  } else {
    if (data.reviewed && data.summary === 'safe') {
      if (warnings.length > 0) {
        icon = <Icon as={AlertTriangle} color="font.warning" size={16} cursor="pointer" />
        level = 1
      } else {
        icon = (
          <Box as="span" cursor="pointer">
            <Image src="/images/icons/notes.svg" alt="Notes" width={16} height={16} />
          </Box>
        )
        level = 2
      }
    } else {
      icon = <Icon as={XCircle} color="red.500" size={16} cursor="pointer" />
      level = 0
    }
  }

  return (
    <RateProviderInfoPopOver level={level} token={token} data={data}>
      {icon}
    </RateProviderInfoPopOver>
  )
}

export function PoolContracts({ ...props }: CardProps) {
  const { pool, chain, poolExplorerLink, hasGaugeAddress, gaugeAddress, gaugeExplorerLink } =
    usePool()

  const { getToken } = useTokens()

  const contracts = useMemo(() => {
    const contracts = [
      {
        label: 'Pool address',
        address: pool.address,
        explorerLink: poolExplorerLink,
      },
    ]

    if (hasGaugeAddress) {
      contracts.push({
        label: 'veBAL gauge',
        address: gaugeAddress,
        explorerLink: gaugeExplorerLink,
      })
    }

    return contracts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, hasGaugeAddress])

  const rateProviders = useMemo(() => {
    return pool.poolTokens
      .map(token => ({
        tokenAddress: token.address,
        rateProviderAddress: token.priceRateProvider,
        priceRateProviderData: token.priceRateProviderData,
      }))
      .filter(
        item => item.rateProviderAddress && item.rateProviderAddress !== zeroAddress
      ) as RateProvider[]
  }, [pool])

  return (
    <Card {...props}>
      <VStack alignItems="flex-start" spacing="md" width="full">
        <Heading variant="h4" fontSize="xl">
          Pool contracts
        </Heading>
        <Divider />
        {contracts.map((contract, index) => (
          <Grid key={index} templateColumns={{ base: '1fr 2fr', md: '1fr 3fr' }} gap="sm" w="full">
            <GridItem>
              <Text minW="120px" variant="secondary">
                {contract.label}:
              </Text>
            </GridItem>
            <GridItem>
              <Link target="_blank" href={contract.explorerLink} variant="link">
                <HStack gap="xxs">
                  <Text color="link">{abbreviateAddress(contract.address)}</Text>
                  <ArrowUpRight size={12} />
                </HStack>
              </Link>
            </GridItem>
          </Grid>
        ))}
        {rateProviders.length > 0 && (
          <Grid templateColumns={{ base: '1fr 2fr', md: '1fr 3fr' }} gap="sm" w="full">
            <GridItem>
              <Tooltip
                // eslint-disable-next-line max-len
                label="Rate Providers are contracts that provide an exchange rate between two assets. This can come from any on-chain source, including oracles or from other calculations. This introduces risks around the rate provider being able to supply accurate and timely exchange rates."
                fontSize="sm"
              >
                <Text minW="120px" variant="secondary">
                  Rate provider(s):
                </Text>
              </Tooltip>
            </GridItem>
            <GridItem>
              <VStack alignItems="flex-start">
                {rateProviders.map(provider => {
                  const token = getToken(provider.tokenAddress, chain)
                  return (
                    token && (
                      <HStack key={provider.tokenAddress}>
                        <Tooltip label={token.symbol} fontSize="sm" shouldWrapChildren>
                          <TokenIcon
                            chain={chain}
                            address={token.address}
                            size={16}
                            alt={token.address}
                          />
                        </Tooltip>
                        <Link
                          key={provider.rateProviderAddress}
                          target="_blank"
                          href={getBlockExplorerAddressUrl(provider.rateProviderAddress, chain)}
                          variant="link"
                        >
                          <HStack gap="xxs">
                            <Text color="link">
                              {abbreviateAddress(provider.rateProviderAddress)}
                            </Text>
                            <ArrowUpRight size={12} />
                          </HStack>
                        </Link>
                        {getRateProviderIcon(provider.priceRateProviderData, token)}
                      </HStack>
                    )
                  )
                })}
              </VStack>
            </GridItem>
          </Grid>
        )}
      </VStack>
    </Card>
  )
}
