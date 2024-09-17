'use client'

import { Card, Divider, HStack, Heading, Skeleton, Stack, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { usePool } from '../../PoolProvider'
import { Address } from 'viem'
import { GqlChain, GqlPoolTokenDetail } from '@/lib/shared/services/api/generated/graphql'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { fNum } from '@/lib/shared/utils/numbers'
import { NoisyCard } from '@/lib/shared/components/containers/NoisyCard'
import { PoolZenGarden } from '@/lib/shared/components/zen/ZenGarden'
import { PoolWeightChart } from '../PoolWeightCharts/PoolWeightChart'
import { useBreakpoints } from '@/lib/shared/hooks/useBreakpoints'
import TokenRow from '@/lib/modules/tokens/TokenRow/TokenRow'
import { useTokens } from '@/lib/modules/tokens/TokensProvider'
import { getPoolDisplayTokens } from '../../pool.utils'

type CardContentProps = {
  totalLiquidity: string
  displayTokens: GqlPoolTokenDetail[]
  chain: GqlChain
}

function CardContent({ totalLiquidity, displayTokens, chain }: CardContentProps) {
  const { toCurrency } = useCurrency()
  const { calcWeightForBalance } = useTokens()
  const { pool } = usePool()

  return (
    <VStack spacing="md" width="full">
      <HStack width="full" justifyContent="space-between">
        <VStack alignItems="flex-start">
          <Heading fontWeight="bold" size={{ base: 'h5', md: 'h6' }}>
            Total liquidity
          </Heading>
        </VStack>
        <VStack alignItems="flex-end">
          <Heading fontWeight="bold" size={{ base: 'h5', md: 'h6' }}>
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
          return (
            <TokenRow
              chain={chain}
              key={`my-liquidity-token-${poolToken.address}`}
              address={poolToken.address as Address}
              value={poolToken.balance}
              actualWeight={calcWeightForBalance(
                poolToken.address,
                poolToken.balance,
                totalLiquidity,
                chain
              )}
              pool={pool}
              targetWeight={poolToken.weight || undefined}
            />
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

  const displayTokens = getPoolDisplayTokens(pool)
  const totalLiquidity = calcTotalUsdValue(displayTokens, chain)

  const CardContentBlock = () => (
    <CardContent totalLiquidity={totalLiquidity} displayTokens={displayTokens} chain={chain} />
  )

  return (
    <Card>
      <Stack
        spacing="md"
        minH="400px"
        direction={{ base: 'column', md: 'row' }}
        justifyContent="stretch"
      >
        <VStack w="full" spacing="md" align="flex-start">
          <Heading fontWeight="bold" size={{ base: 'h4', md: 'h5' }}>
            Pool composition
          </Heading>
          {isMobile ? (
            <CardContentBlock />
          ) : (
            <Card variant="subSection" w="full">
              <CardContentBlock />
            </Card>
          )}
          {isMobile && <Divider />}
          <Text color="grayText" mt="auto" fontSize="sm" pb="sm">
            From {fNum('integer', pool.dynamicData.holdersCount)} Liquidity Providers
          </Text>
        </VStack>
        <NoisyCard
          cardProps={{ position: 'relative', overflow: 'hidden', height: ['300px', '400px'] }}
          contentProps={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <PoolZenGarden sizePx={isMobile ? '300px' : '400px'} poolType={pool.type} />
          {isLoading ? (
            <Skeleton w="full" h="full" />
          ) : (
            <PoolWeightChart
              displayTokens={displayTokens}
              chain={chain}
              totalLiquidity={totalLiquidity}
            />
          )}
        </NoisyCard>
      </Stack>
    </Card>
  )
}
