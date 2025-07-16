import { Card, HStack, Spacer, Text, VStack } from '@chakra-ui/react'
import {
  GqlChain,
  GqlLbpTopTrade,
  GqlPoolLiquidityBootstrappingV3,
} from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'
import { EnsOrAddress } from '../../user/EnsOrAddress'
import { fNum } from '@repo/lib/shared/utils/numbers'

export function Top10Trades({
  chain,
  pool,
}: {
  chain: GqlChain
  pool: GqlPoolLiquidityBootstrappingV3
}) {
  const trades = pool.topTrades || []

  return (
    <Card>
      <VStack spacing="5" w="full">
        <HStack w="full">
          <Text fontSize="lg" fontWeight="bold">
            Biggest transactions during the sale
          </Text>
        </HStack>
        <VStack w="full">
          {trades.map(
            (trade, index) =>
              trade && <Row chain={chain} key={trade.address + index} trade={trade} />
          )}
        </VStack>
      </VStack>
    </Card>
  )
}

export function Row({ trade, chain }: { trade: GqlLbpTopTrade; chain: GqlChain }) {
  return (
    <HStack w="full">
      <EnsOrAddress chain={chain} userAddress={trade.address as Address} />
      <Spacer />
      <Text fontSize="md">{`$${fNum('fiat', trade.value)}`}</Text>
    </HStack>
  )
}
