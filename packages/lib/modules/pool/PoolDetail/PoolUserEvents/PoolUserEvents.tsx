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
import { usePool } from '../../PoolProvider'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import {
  GetPoolEventsQuery,
  GqlChain,
  GqlPoolStakingType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { formatDistanceToNow, secondsToMilliseconds } from 'date-fns'
import { useBlockExplorer } from '@repo/lib/shared/hooks/useBlockExplorer'
import { ArrowUpRight } from 'react-feather'
import { PoolEventItem } from '../../usePoolEvents'
import { calcTotalStakedBalance, getUserTotalBalance } from '../../user-balance.helpers'
import { fNum, bn } from '@repo/lib/shared/utils/numbers'
import { isEmpty } from 'lodash'
import { BoostText } from './BoostText'

type PoolEventRowProps = {
  poolEvent: PoolEventItem
  usdValue: string
  chain: GqlChain
  txUrl: string
}

const GRID_COLUMNS = '100px 150px 100px 1fr'

function Action({ isTypeAdd }: { isTypeAdd: boolean }) {
  return (
    <HStack>
      <Box
        as="span"
        backgroundColor={isTypeAdd ? 'green.500' : 'red.500'}
        borderRadius="50%"
        display="inline-block"
        h="8px"
        w="8px"
      />
      <Text>{isTypeAdd ? 'Add' : 'Remove'}</Text>
    </HStack>
  )
}

function PoolEventRow({ poolEvent, usdValue, chain, txUrl }: PoolEventRowProps) {
  if (poolEvent.__typename !== 'GqlPoolAddRemoveEventV3') {
    return null
  }

  const isTypeAdd = poolEvent.type === 'ADD'

  const Tokens = () =>
    poolEvent.tokens
      .filter(token => token.amount !== '0')
      .map(token => (
        <HStack gap={['xs', 'sm']} key={token.address} mb="sm">
          <TokenIcon address={token.address} alt={token.address} chain={chain} size={24} />
          <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {fNum('token', token.amount)}
          </Text>
        </HStack>
      ))

  return (
    <Grid
      gap={{ base: '2', md: '4' }}
      mb="4"
      templateAreas={{
        base: `"action value time"
               "tokens tokens tokens"`,
        md: `"action tokens value time"`,
      }}
      templateColumns={{ base: 'fit-content(150px) 50px 1fr', md: GRID_COLUMNS }}
      w="full"
    >
      <GridItem area="action">
        <Action isTypeAdd={isTypeAdd} />
      </GridItem>
      <GridItem area="tokens">
        <Tokens />
      </GridItem>
      <GridItem area="value" textAlign={{ base: 'left', md: 'right' }}>
        <Text>{usdValue}</Text>
      </GridItem>
      <GridItem area="time" mr="sm">
        <HStack gap="1" justifyContent="flex-end">
          <Text color="grayText">
            {formatDistanceToNow(new Date(secondsToMilliseconds(poolEvent.timestamp)), {
              addSuffix: true,
            })}
          </Text>
          <Link color="grayText" href={txUrl} target="_blank">
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

  const isVeBal = pool.staking?.type === GqlPoolStakingType.Vebal
  const showBoostValue = pool.staking?.type === GqlPoolStakingType.Gauge && !isVeBal

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

  return (
    <Card h={height}>
      {isLoading && <Skeleton h="full" w="full" />}
      {!isLoading && (
        <VStack alignItems="flex-start" h="full" spacing="md" w="full">
          <Heading
            backgroundClip="text"
            bg="font.special"
            fontWeight="bold"
            lineHeight="34px" // to align with 'My liquidity'
            size="h5"
          >
            My transactions
          </Heading>
          <Divider />
          <Box display={{ base: 'none', md: 'block' }} w="full">
            <Grid gap="4" templateColumns={{ base: '1fr', md: GRID_COLUMNS }} w="full">
              {['Action', 'Tokens', 'Value', 'Time'].map((label, index) => (
                <GridItem
                  key={label}
                  mr={index === 3 ? 'md' : 0}
                  textAlign={index > 1 ? 'right' : 'left'}
                >
                  <Text fontSize="0.85rem" fontWeight="medium" variant="secondary">
                    {label}
                  </Text>
                </GridItem>
              ))}
            </Grid>
            <Divider mt="md" />
          </Box>
          <Box overflowY="auto" w="full">
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
                  chain={chain}
                  key={poolEvent.id}
                  poolEvent={poolEvent}
                  txUrl={getBlockExplorerTxUrl(poolEvent.tx)}
                  usdValue={toCurrency(poolEvent.valueUSD)}
                />
              ))
            )}
          </Box>
          <Divider />
          <HStack mt="auto" spacing="4">
            <Text fontSize="0.85rem" variant="secondary">
              {`${stakedPercentage} ${getShareTitle()}`}
            </Text>
            {showBoostValue && <BoostText pool={pool} />}
          </HStack>
        </VStack>
      )}
    </Card>
  )
}
