import { Card, Divider, Text, Box, HStack, Skeleton } from '@chakra-ui/react'
import { usePool } from '../../PoolProvider'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import {
  GetPoolEventsQuery,
  GqlChain,
  GqlPoolStakingType,
  GqlPoolAddRemoveEventV3,
  GqlPoolSwapEventV3,
} from '@repo/lib/shared/services/api/generated/graphql'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { calcTotalStakedBalance, getUserTotalBalance } from '../../user-balance.helpers'
import { fNum, bn } from '@repo/lib/shared/utils/numbers'
import { BoostText } from './BoostText'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { CardContent } from '@repo/lib/modules/pool/PoolDetail/PoolUserEvents/CardContent'
import { PoolEventItem } from '@repo/lib/modules/pool/usePoolEvents'

const GRID_COLUMNS = '100px 150px 100px 1fr'

export type ActionProps = {
  poolEventType: 'Add' | 'Remove' | 'Swap'
}

function Action({ poolEventType }: ActionProps) {
  const eventTypeColor =
    poolEventType === 'Add' ? 'green.500' : poolEventType === 'Remove' ? 'red.500' : 'blue.500'
  return (
    <HStack>
      <Box
        as="span"
        backgroundColor={eventTypeColor}
        borderRadius="50%"
        display="inline-block"
        h="8px"
        w="8px"
      />
      <Text>{poolEventType}</Text>
    </HStack>
  )
}

export type TokensProps = {
  poolEvent: PoolEventItem
  chain: GqlChain
}

function Tokens({ poolEvent, chain }: TokensProps) {
  if (poolEvent.__typename === 'GqlPoolSwapEventV3') {
    const swapEvent = poolEvent as GqlPoolSwapEventV3
    return <SwapTokens chain={chain} swapEvent={swapEvent} />
  }

  const addRemoveEvent = poolEvent as GqlPoolAddRemoveEventV3
  return <AddRemoveTokens addRemoveEvent={addRemoveEvent} chain={chain} />
}

function AddRemoveTokens({
  addRemoveEvent,
  chain,
}: {
  addRemoveEvent: GqlPoolAddRemoveEventV3
  chain: GqlChain
}) {
  return addRemoveEvent.tokens
    .filter(token => token.amount !== '0')
    .map(token => (
      <HStack gap={['xs', 'sm']} key={token.address} mb="sm">
        <TokenIcon address={token.address} alt={token.address} chain={chain} size={24} />
        <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {fNum('token', token.amount)}
        </Text>
      </HStack>
    ))
}

function SwapTokens({ swapEvent, chain }: { swapEvent: GqlPoolSwapEventV3; chain: GqlChain }) {
  const tokenIn = swapEvent.tokenIn
  const tokenOut = swapEvent.tokenOut
  return (
    <>
      <HStack gap={['xs', 'sm']} mb="sm">
        <TokenIcon address={tokenIn.address} alt={tokenIn.address} chain={chain} size={24} />
        <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {fNum('token', tokenIn.amount)} in
        </Text>
      </HStack>

      <HStack gap={['xs', 'sm']} mb="sm">
        <TokenIcon
          address={swapEvent.tokenOut.address}
          alt={swapEvent.tokenOut.address}
          chain={chain}
          size={24}
        />
        <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {fNum('token', tokenOut.amount)} out
        </Text>
      </HStack>
    </>
  )
}

export default function PoolUserEvents({
  userPoolEvents,
  isLoading,
}: {
  userPoolEvents: GetPoolEventsQuery['poolEvents'] | undefined
  isLoading: boolean
}) {
  const { myLiquiditySectionRef, pool } = usePool()
  const [height, setHeight] = useState(0)
  const [poolEvents, setPoolEvents] = useState<PoolEventItem[]>([])

  const {
    options: { showVeBal },
  } = PROJECT_CONFIG

  const isVeBalPoolStaking = pool.staking?.type === GqlPoolStakingType.Vebal
  const showBoostValue =
    pool.staking?.type === GqlPoolStakingType.Gauge && !isVeBalPoolStaking && showVeBal

  // keep this card the same height as the 'My liquidity' section
  useLayoutEffect(() => {
    if (myLiquiditySectionRef && myLiquiditySectionRef.current) {
      setHeight(myLiquiditySectionRef.current.offsetHeight)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isLoading && userPoolEvents?.length) {
      setPoolEvents(userPoolEvents)
    }
  }, [userPoolEvents, isLoading])

  function getShareTitle() {
    if (showVeBal) {
      return 'locked'
    }

    return 'staked'
  }

  const stakedPercentage = useMemo(() => {
    const totalBalance = getUserTotalBalance(pool)
    const stakedBalance = calcTotalStakedBalance(pool)
    const ratio = bn(stakedBalance).div(totalBalance)

    if (stakedBalance === '0') {
      return fNum('percentage', 0)
    } else if (ratio.isGreaterThan(0.99999) && ratio.isLessThan(1.00001)) {
      // to avoid very small rounding errors
      return fNum('percentage', 1)
    } else {
      return fNum('stakedPercentage', ratio)
    }
  }, [pool])

  return (
    <Card h={height}>
      {isLoading && <Skeleton h="full" w="full" />}
      {!isLoading && (
        <CardContent
          actionComponent={Action}
          gridColumns={GRID_COLUMNS}
          poolEvents={poolEvents}
          tokensComponent={Tokens}
        >
          <Divider />
          <HStack mt="auto" spacing="4">
            <Text fontSize="0.85rem" variant="secondary">
              {`${stakedPercentage} ${getShareTitle()}`}
            </Text>
            {showBoostValue && <BoostText pool={pool} />}
          </HStack>
        </CardContent>
      )}
    </Card>
  )
}
