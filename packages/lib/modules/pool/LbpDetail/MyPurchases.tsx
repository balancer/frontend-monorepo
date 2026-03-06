import TokenRow from '../../tokens/TokenRow/TokenRow'
import { Card, HStack, Heading, Text, VStack, Spacer, Skeleton, Separator } from '@chakra-ui/react'
import { usePool } from '../PoolProvider'
import { Address } from 'viem'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'

import {
  GetPoolEventsQuery,
  GqlPoolLiquidityBootstrappingV3,
  GqlPoolSwapEventV3,
} from '@repo/lib/shared/services/api/generated/graphql'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useState, useEffect } from 'react'

export function MyPurchases({
  userPoolEvents,
  loading,
}: {
  userPoolEvents: GetPoolEventsQuery['poolEvents'] | undefined
  loading: boolean
}) {
  const { pool, chain, myLbpTransactionsSectionRef } = usePool()
  const { priceFor } = useTokens()
  const [height, setHeight] = useState(0)

  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3
  const projectToken = lbpPool.poolTokens[lbpPool.projectTokenIndex]

  const userProjectTokenBalance = calculateBalance(userPoolEvents, projectToken.address as Address)
  const shareOfSale = userProjectTokenBalance.div(projectToken.balance)

  const currentPrice = priceFor(projectToken.address as Address, chain)

  // keep this card the same height as the 'My Transactions' section (LBP)
  useEffect(() => {
    if (myLbpTransactionsSectionRef && myLbpTransactionsSectionRef.current) {
      setHeight(myLbpTransactionsSectionRef.current.offsetHeight)
    }
  }, [])

  return (
    <Card.Root h={['fit-content', height]}>
      {loading && <Skeleton h="full" w="full" />}
      {!loading && (
        <VStack align="start" gap="md" h="full" width="full">
          <Heading backgroundClip="text" bg="font.special" fontWeight="bold" size="h5">
            My purchases
          </Heading>
          <Separator />
          <TokenRow
            abbreviated={false}
            address={projectToken.address as Address}
            chain={chain}
            customUsdPrice={currentPrice}
            logoURI={projectToken.logoURI || ''}
            pool={pool}
            value={userProjectTokenBalance}
          />
          <Spacer />
          <Separator />
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
    </Card.Root>
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
