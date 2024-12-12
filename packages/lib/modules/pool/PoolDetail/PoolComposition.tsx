'use client'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Card,
  Divider,
  HStack,
  Heading,
  Skeleton,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Pool, usePool } from '../PoolProvider'
import { Address } from 'viem'
import { GqlChain, GqlPoolTokenDetail } from '@repo/lib/shared/services/api/generated/graphql'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PoolZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import { PoolWeightChart } from './PoolWeightCharts/PoolWeightChart'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { getPoolDisplayTokens, getPoolDisplayTokensWithPossibleNestedPools } from '../pool.utils'
import { PoolTypeTag } from './PoolTypeTag'
import { isBoosted } from '../pool.helpers'
import { useLayoutEffect, useRef, useState } from 'react'
import { useErc4626Metadata } from '../../erc4626/Erc4626MetadataProvider'

type CardContentProps = {
  totalLiquidity: string
  displayTokens: GqlPoolTokenDetail[]
  chain: GqlChain
  pool: Pool
}

function CardContent({ totalLiquidity, displayTokens, chain, pool }: CardContentProps) {
  const { toCurrency } = useCurrency()
  const { calcWeightForBalance } = useTokens()

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
              toCurrency(totalLiquidity, { abbreviated: false })
            ) : (
              <Skeleton height="24px" w="75px" />
            )}
          </Heading>
        </VStack>
      </HStack>
      <Divider />
      <VStack spacing="md" width="full">
        {displayTokens.map(poolToken => {
          const actualWeight = calcWeightForBalance(
            poolToken.address,
            poolToken.balance,
            totalLiquidity,
            chain
          )
          return (
            <VStack key={`pool-${poolToken.address}`} w="full">
              <TokenRow
                actualWeight={actualWeight}
                address={poolToken.address as Address}
                chain={chain}
                pool={pool}
                targetWeight={poolToken.weight || undefined}
                value={poolToken.balance}
                {...(poolToken.hasNestedPool && {
                  isNestedBpt: true,
                })}
              />
              {poolToken.hasNestedPool && poolToken.nestedPool && (
                <VStack pl="8" w="full">
                  {poolToken.nestedPool.tokens.map(nestedPoolToken => {
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
  const { pool, chain, isLoading } = usePool()
  const { isMobile } = useBreakpoints()
  const { calcTotalUsdValue } = useTokens()
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [height, setHeight] = useState(0)
  const { getErc4626Metadata } = useErc4626Metadata()

  const displayTokens = getPoolDisplayTokens(pool)
  const totalLiquidity = calcTotalUsdValue(displayTokens, chain)
  const erc4626Metadata = getErc4626Metadata(pool)

  useLayoutEffect(() => {
    if (cardRef.current) {
      setHeight(cardRef.current.offsetHeight)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card ref={cardRef}>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        justifyContent="stretch"
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
          {isBoosted(pool) &&
            erc4626Metadata.map(metadata => (
              <Alert key={metadata.name} status="info">
                <AlertIcon />
                <AlertDescription>{metadata.description}</AlertDescription>
              </Alert>
            ))}
          <Divider />
          <CardContent
            chain={chain}
            displayTokens={displayTokens}
            pool={pool}
            totalLiquidity={totalLiquidity}
          />
          <Divider mt="auto" />
          <Text color="grayText" fontSize="sm" pb="sm">
            From {fNum('integer', pool.dynamicData.holdersCount)} Liquidity Providers
          </Text>
        </VStack>
        <NoisyCard
          cardProps={{
            position: 'relative',
            overflow: 'hidden',
            height: ['300px', `${height - 35}px`],
          }}
          contentProps={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <PoolZenGarden poolType={pool.type} sizePx={isMobile ? '300px' : `${height - 35}px`} />
          {isLoading ? (
            <Skeleton h="full" w="full" />
          ) : (
            <PoolWeightChart
              chain={chain}
              displayTokens={getPoolDisplayTokensWithPossibleNestedPools(pool)}
              hasLegend
              totalLiquidity={totalLiquidity}
            />
          )}
        </NoisyCard>
      </Stack>
    </Card>
  )
}
