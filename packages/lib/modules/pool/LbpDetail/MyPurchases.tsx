import TokenRow from '../../tokens/TokenRow/TokenRow'
import { Divider, Card, HStack, Heading, Text, VStack, Spacer, Stack } from '@chakra-ui/react'
import { usePool } from '../PoolProvider'
import { Address } from 'viem'
import { bn, fNum, Numberish } from '@repo/lib/shared/utils/numbers'
import { calcUserShareOfPool } from '../pool.helpers'
import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'

export function MyPurchases() {
  const { pool, chain, myLiquiditySectionRef } = usePool()
  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3

  function calculateBalance(): Numberish {
    // FIXME: [JUANJO] this balance is the total balance of the pool
    const token = pool.poolTokens.find(token => token.address === lbpPool.projectToken)
    if (!token) return 0

    return bn(token.balance).shiftedBy(-token.decimals)
  }

  // FIXME: [JUANJO] we should calculate this based on the current pool balances provided by the API
  const shareOfSale = calcUserShareOfPool(pool)
  console.log(pool)

  return (
    <Card h="fit-content" ref={myLiquiditySectionRef}>
      <VStack spacing="md" width="full">
        <Stack w="full">
          <Heading backgroundClip="text" bg="font.special" fontWeight="bold" size="h5">
            My purchases
          </Heading>
        </Stack>

        <Divider />

        <TokenRow
          abbreviated={false}
          address={lbpPool.projectToken as Address}
          chain={chain}
          pool={pool}
          value={calculateBalance()}
        />

        <Divider />

        <HStack w="full">
          <Text fontSize="0.85rem" variant="secondary">
            My share of tokens sold
          </Text>
          <Spacer />
          <Text fontSize="0.85rem" variant="secondary">
            {bn(shareOfSale).gt(0) ? fNum('sharePercent', shareOfSale) : '—'}
          </Text>
        </HStack>
      </VStack>
    </Card>
  )
}
