import TokenRow from '../../tokens/TokenRow/TokenRow'
import {
  Divider,
  Card,
  HStack,
  Heading,
  Text,
  VStack,
  Spacer,
  Stack,
  Skeleton,
} from '@chakra-ui/react'
import { usePool } from '../PoolProvider'
import { Address } from 'viem'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'

import {
  GetPoolEventsQuery,
  GqlPoolLiquidityBootstrappingV3,
  GqlPoolSwapEventV3,
} from '@repo/lib/shared/services/api/generated/graphql'
import { usePriceInfo, getCurrentPrice } from '@repo/lib/modules/lbp/pool/usePriceInfo'

export function MyPurchases({
  userPoolEvents,
  isLoading,
}: {
  userPoolEvents: GetPoolEventsQuery['poolEvents'] | undefined
  isLoading: boolean
}) {
  const { pool, chain, myLiquiditySectionRef } = usePool()
  const { prices } = usePriceInfo(pool.chain, pool.id as Address)

  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3
  const projectToken = pool.poolTokens[lbpPool.projectTokenIndex]

  const userProjectTokenBalance = calculateBalance(userPoolEvents, projectToken.address as Address)
  const shareOfSale = userProjectTokenBalance.div(projectToken.balance)

  const currentPrice = getCurrentPrice(prices)

  return (
    <Card h="fit-content" ref={myLiquiditySectionRef}>
      {isLoading && <Skeleton h="full" w="full" />}
      {!isLoading && (
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
            customUsdPrice={currentPrice}
            pool={pool}
            value={userProjectTokenBalance}
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
      )}
    </Card>
  )
}

function calculateBalance(
  userPoolEvents: GetPoolEventsQuery['poolEvents'] | undefined,
  projectTokenAddress: Address
): BigNumber {
  if (!userPoolEvents) return bn(0)

  return userPoolEvents.reduce((acc, event) => {
    if (!['GqlPoolSwapEventV3'].includes(event.__typename)) return acc

    const swapEvent = event as GqlPoolSwapEventV3
    const eventType = swapEvent.tokenOut.address === projectTokenAddress ? 'Buy' : 'Sell'
    if (eventType === 'Buy') {
      return acc.plus(swapEvent.tokenOut.amount)
    } else {
      return acc.minus(swapEvent.tokenIn.amount)
    }
  }, bn(0))
}
