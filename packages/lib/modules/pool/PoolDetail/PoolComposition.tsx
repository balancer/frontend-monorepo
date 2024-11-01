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
import { usePool } from '../PoolProvider'
import { Address } from 'viem'
import { GqlChain, GqlPoolTokenDetail } from '@repo/lib/shared/services/api/generated/graphql'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PoolZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import { PoolWeightChart } from './PoolWeightCharts/PoolWeightChart'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { getPoolDisplayTokens } from '../pool.utils'
import { PoolTypeTag } from './PoolTypeTag'
import { isBoosted } from '../pool.helpers'
import { Protocol, protocolMessages } from '@repo/lib/modules/protocols/useProtocols'

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
      <HStack justifyContent="space-between" width="full">
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
              actualWeight={calcWeightForBalance(
                poolToken.address,
                poolToken.balance,
                totalLiquidity,
                chain
              )}
              address={poolToken.address as Address}
              chain={chain}
              key={`my-liquidity-token-${poolToken.address}`}
              pool={pool}
              targetWeight={poolToken.weight || undefined}
              value={poolToken.balance}
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

  return (
    <Card>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        justifyContent="stretch"
        minH="400px"
        spacing="md"
      >
        <VStack align="flex-start" spacing="md" w="full">
          <HStack justifyContent="space-between" w="full">
            <Heading fontWeight="bold" size={{ base: 'h4', md: 'h5' }}>
              Pool composition
            </Heading>
            <PoolTypeTag pool={pool} />
          </HStack>
          {isBoosted(pool) && (
            <Alert status="info">
              <AlertIcon />
              {/* TODO: set protocol dynamically */}
              <AlertDescription>{protocolMessages[Protocol.Aave]}</AlertDescription>
            </Alert>
          )}
          <Divider />
          <CardContent
            chain={chain}
            displayTokens={displayTokens}
            totalLiquidity={totalLiquidity}
          />
          <Divider mt="auto" />
          <Text color="grayText" fontSize="sm" pb="sm">
            From {fNum('integer', pool.dynamicData.holdersCount)} Liquidity Providers
          </Text>
        </VStack>
        <NoisyCard
          cardProps={{ position: 'relative', overflow: 'hidden', height: ['300px', '400px'] }}
          contentProps={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <PoolZenGarden poolType={pool.type} sizePx={isMobile ? '300px' : '400px'} />
          {isLoading ? (
            <Skeleton h="full" w="full" />
          ) : (
            <PoolWeightChart
              chain={chain}
              displayTokens={displayTokens}
              totalLiquidity={totalLiquidity}
            />
          )}
        </NoisyCard>
      </Stack>
    </Card>
  )
}
