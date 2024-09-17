import {
  Card,
  VStack,
  Heading,
  Divider,
  Grid,
  GridItem,
  Text,
  Box,
  HStack,
  Link,
  Skeleton,
} from '@chakra-ui/react'
import { usePool } from '../PoolProvider'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { GetPoolEventsQuery, GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { TokenIcon } from '@/lib/modules/tokens/TokenIcon'
import { formatDistanceToNow, secondsToMilliseconds } from 'date-fns'
import { useBlockExplorer } from '@/lib/shared/hooks/useBlockExplorer'
import { ArrowUpRight } from 'react-feather'
import { PoolEventItem } from '../usePoolEvents'
import { calcTotalStakedBalance, getUserTotalBalance } from '../user-balance.helpers'
import { fNum, bn } from '@/lib/shared/utils/numbers'
import { useVebalBoost } from '@/lib/modules/vebal/useVebalBoost'
import { isEmpty } from 'lodash'
import { isVebalPool } from '../pool.helpers'

type PoolEventRowProps = {
  poolEvent: PoolEventItem
  usdValue: string
  chain: GqlChain
  txUrl: string
}

const GRID_COLUMNS = '100px 150px 100px 1fr'

function PoolEventRow({ poolEvent, usdValue, chain, txUrl }: PoolEventRowProps) {
  if (poolEvent.__typename !== 'GqlPoolAddRemoveEventV3') {
    return null
  }

  const isTypeAdd = poolEvent.type === 'ADD'

  const Action = () => (
    <HStack>
      <Box
        as="span"
        h="8px"
        w="8px"
        borderRadius="50%"
        display="inline-block"
        backgroundColor={isTypeAdd ? 'green.500' : 'red.500'}
      ></Box>
      <Text>{isTypeAdd ? 'Add' : 'Remove'}</Text>
    </HStack>
  )

  const Tokens = () =>
    poolEvent.tokens
      .filter(token => token.amount !== '0')
      .map(token => (
        <HStack gap={['xs', 'sm']} key={token.address} mb="sm">
          <TokenIcon chain={chain} address={token.address} size={24} alt={token.address} />
          <Text textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
            {fNum('token', token.amount)}
          </Text>
        </HStack>
      ))

  return (
    <Grid
      w="full"
      templateColumns={{ base: 'fit-content(150px) 50px 1fr', md: GRID_COLUMNS }}
      templateAreas={{
        base: `"action value time"
               "tokens tokens tokens"`,
        md: `"action tokens value time"`,
      }}
      gap={{ base: '2', md: '4' }}
      mb="4"
    >
      <GridItem area="action">
        <Action />
      </GridItem>
      <GridItem area="tokens">
        <Tokens />
      </GridItem>
      <GridItem area="value" textAlign={{ base: 'left', md: 'right' }}>
        <Text>{usdValue}</Text>
      </GridItem>
      <GridItem area="time" mr="sm">
        <HStack justifyContent="flex-end" gap="1">
          <Text color="grayText">
            {formatDistanceToNow(new Date(secondsToMilliseconds(poolEvent.timestamp)), {
              addSuffix: true,
            })}
          </Text>
          <Link href={txUrl} target="_blank" color="grayText">
            <ArrowUpRight size={16} />
          </Link>
        </HStack>
      </GridItem>
    </Grid>
  )
}

export default function PoolUserEvents({
  userPoolEvents,
  isLoading,
}: {
  userPoolEvents: GetPoolEventsQuery['poolEvents'] | undefined
  isLoading: boolean
}) {
  const { myLiquiditySectionRef, chain, pool } = usePool()
  const [height, setHeight] = useState(0)
  const [poolEvents, setPoolEvents] = useState<PoolEventItem[]>([])
  const { toCurrency } = useCurrency()
  const { getBlockExplorerTxUrl } = useBlockExplorer(chain)
  const { veBalBoostMap } = useVebalBoost([pool])

  const isVeBal = isVebalPool(pool.id)
  const showBoostValue = !isVeBal

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
    if (isVeBal) {
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

  const boost = useMemo(() => {
    const boost = veBalBoostMap[pool.id]

    if (!boost || boost === '1') {
      return '1.00'
    }

    return fNum('boost', bn(boost))
  }, [veBalBoostMap, pool])

  return (
    <Card h={height}>
      {isLoading && <Skeleton w="full" h="full" />}
      {!isLoading && (
        <VStack spacing="md" w="full" h="full" alignItems="flex-start">
          <Heading
            bg="font.special"
            backgroundClip="text"
            fontWeight="bold"
            size="h5"
            lineHeight="34px" // to align with 'My liquidity'
          >
            My transactions
          </Heading>
          <Divider />
          <Box display={{ base: 'none', md: 'block' }} w="full">
            <Grid w="full" templateColumns={{ base: '1fr', md: GRID_COLUMNS }} gap="4">
              {['Action', 'Tokens', 'Value', 'Time'].map((label, index) => (
                <GridItem
                  key={index}
                  textAlign={index > 1 ? 'right' : 'left'}
                  mr={index === 3 ? 'md' : 0}
                >
                  <Text fontWeight="medium" variant="secondary" fontSize="0.85rem">
                    {label}
                  </Text>
                </GridItem>
              ))}
            </Grid>
            <Divider mt="md" />
          </Box>
          <Box w="full" overflowY="auto">
            {isEmpty(poolEvents) ? (
              <>
                <Text variant="secondary">No recent transactions</Text>
                <Text variant="secondary">
                  Note: Recent transactions may take a few minutes to display here.
                </Text>
              </>
            ) : (
              poolEvents.map(poolEvent => (
                <PoolEventRow
                  poolEvent={poolEvent}
                  key={poolEvent.id}
                  usdValue={toCurrency(poolEvent.valueUSD)}
                  chain={chain}
                  txUrl={getBlockExplorerTxUrl(poolEvent.tx)}
                />
              ))
            )}
          </Box>
          <Divider />
          <HStack spacing="4" mt="auto">
            <Text variant="secondary" fontSize="0.85rem">
              {`${stakedPercentage} ${getShareTitle()}`}
            </Text>
            {showBoostValue && (
              <>
                <Text variant="secondary" fontSize="0.85rem">
                  &middot;
                </Text>
                <Text variant="secondary" fontSize="0.85rem">
                  {`${boost}x boost`}
                </Text>
              </>
            )}
          </HStack>
        </VStack>
      )}
    </Card>
  )
}
