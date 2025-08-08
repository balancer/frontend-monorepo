'use client'

import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import {
  Box,
  Card,
  Divider,
  HStack,
  Heading,
  Skeleton,
  Stack,
  Text,
  VStack,
  Link,
} from '@chakra-ui/react'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { useLayoutEffect, useRef, useState } from 'react'
import { Address } from 'viem'
import { usePoolsMetadata } from '../metadata/PoolsMetadataProvider'
import { isBoosted, isQuantAmmPool } from '../pool.helpers'
import { PoolToken } from '../pool.types'
import { usePool } from '../PoolProvider'
import { Pool } from '../pool.types'
import { PoolTypeTag } from './PoolTypeTag'
import { getCompositionTokens, getNestedPoolTokens } from '../pool-tokens.utils'
import { useGetPoolTokensWithActualWeights } from '../useGetPoolTokensWithActualWeights'
import { ArrowUpRight } from 'react-feather'
import { PoolCompositionChart } from './PoolCompositionChart'
import { PoolTotalLiquidityValue } from './PoolTotalLiquidityValue'
import { Erc4626Metadata } from '../metadata/getErc4626Metadata'

type CardContentProps = {
  totalLiquidity: string
  poolTokens: PoolToken[]
  chain: GqlChain
  pool: Pool
}

function CardContent({ totalLiquidity, poolTokens, chain, pool }: CardContentProps) {
  const { toCurrency } = useCurrency()
  const { poolTokensWithActualWeights } = useGetPoolTokensWithActualWeights()

  return (
    <VStack spacing="md" width="full">
      <HStack justifyContent="space-between" width="full">
        <VStack alignItems="flex-start">
          <Heading fontWeight="bold" size="h5">
            Total liquidity
          </Heading>
        </VStack>
        <VStack alignItems="flex-end">
          <Heading fontWeight="bold" size="h5">
            {totalLiquidity ? (
              <PoolTotalLiquidityValue
                totalLiquidity={toCurrency(totalLiquidity, { abbreviated: false })}
              />
            ) : (
              <Skeleton height="24px" w="75px" />
            )}
          </Heading>
        </VStack>
      </HStack>
      <Divider />
      <VStack spacing="md" width="full">
        {poolTokens.map(poolToken => {
          const actualWeight = poolTokensWithActualWeights[poolToken.address]

          return (
            <VStack key={`pool-${poolToken.address}`} w="full">
              <TokenRow
                actualWeight={actualWeight}
                address={poolToken.address as Address}
                chain={chain}
                pool={pool}
                showZeroAmountAsDash={true}
                targetWeight={poolToken.weight || undefined}
                value={poolToken.balance}
                {...(poolToken.hasNestedPool && {
                  isNestedBpt: true,
                })}
              />
              {poolToken.hasNestedPool && poolToken.nestedPool && (
                <VStack pl="8" w="full">
                  {getNestedPoolTokens(poolToken).map(nestedPoolToken => {
                    const calculatedWeight = bn(nestedPoolToken.balanceUSD).div(
                      bn(poolToken.balanceUSD)
                    )
                    return (
                      <TokenRow
                        actualWeight={bn(actualWeight).times(calculatedWeight).toString()}
                        address={nestedPoolToken.address as Address}
                        chain={chain}
                        iconSize={35}
                        isNestedPoolToken
                        key={`nested-pool-${nestedPoolToken.address}`}
                        targetWeight={
                          nestedPoolToken.weight && poolToken.weight
                            ? bn(nestedPoolToken.weight).times(poolToken.weight).toString()
                            : undefined
                        }
                        value={nestedPoolToken.balance}
                      />
                    )
                  })}
                </VStack>
              )}
            </VStack>
          )
        })}
      </VStack>
    </VStack>
  )
}

export function PoolComposition() {
  const { pool, chain } = usePool()
  const { isMobile } = useBreakpoints()
  const { calcTotalUsdValue } = useTokens()
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [height, setHeight] = useState(0)
  const { getErc4626Metadata } = usePoolsMetadata()

  const compositionTokens = getCompositionTokens(pool)
  const totalLiquidity = calcTotalUsdValue(compositionTokens, chain)
  const erc4626Metadata = getErc4626Metadata(pool)

  function getBoostedInfoAlertMsg(erc4626Metadata: Erc4626Metadata[]) {
    const protocolNames = erc4626Metadata.map(metadata => metadata.name.split(' ')[0])

    let protocols = ''
    if (protocolNames.length === 1) protocols = protocolNames[0]
    if (protocolNames.length > 1)
      protocols =
        protocolNames.slice(0, -1).join(', ') + ` and ` + protocolNames[protocolNames.length - 1]

    return `This Boosted pool uses wrapped ${protocols} tokens to generate yield from lending on ${protocolNames.length === 1 ? 'that protocol' : 'those protocols'}. This results in continuous appreciation of the pool's total value over time.`
  }

  useLayoutEffect(() => {
    if (cardRef.current) {
      setHeight(cardRef.current.offsetHeight)
    }

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0] && entries[0].target instanceof HTMLElement) {
        setHeight(entries[0].target.offsetHeight)
      }
    })

    if (cardRef.current) {
      resizeObserver.observe(cardRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [pool.id])

  return (
    <Card ref={cardRef}>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        justifyContent="stretch"
        maxH="900px"
        minH="400px"
        spacing="md"
      >
        <VStack align="flex-start" spacing="md" w="full">
          <HStack justifyContent="space-between" w="full">
            <Heading fontWeight="bold" size="h4">
              Pool composition
            </Heading>
            <PoolTypeTag pool={pool} />
          </HStack>
          {isBoosted(pool) && (
            <BalAlert
              content={
                <Text color="font.dark" fontSize="sm">
                  {getBoostedInfoAlertMsg(erc4626Metadata)}
                </Text>
              }
              status="info"
            />
          )}
          {isQuantAmmPool(pool.type) && (
            <BalAlert
              content={
                <Text color="font.dark" fontSize="sm" position="relative" top="2px">
                  Tokens in BTFs dynamically shift weights to capture appreciation.{' '}
                  <Link
                    alignItems="center"
                    color="black"
                    display="inline-flex"
                    fontSize="sm"
                    href="https://medium.com/@QuantAMM/quantamm-x-balancer-v3-046af77ddc81"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Box as="span">Learn more</Box>
                    <Box as="span" ml={0.5}>
                      <ArrowUpRight size={12} />
                    </Box>
                  </Link>
                </Text>
              }
              status="info"
            />
          )}
          <Divider />
          <CardContent
            chain={chain}
            pool={pool}
            poolTokens={compositionTokens}
            totalLiquidity={totalLiquidity}
          />
          <Divider mt="auto" />
          <Text color="grayText" fontSize="sm" pb="sm">
            From {fNum('integer', pool.dynamicData.holdersCount)} Liquidity Providers
          </Text>
        </VStack>
        <PoolCompositionChart height={height} isMobile={!!isMobile} />
      </Stack>
    </Card>
  )
}
