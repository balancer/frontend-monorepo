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
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import {
  GetPoolEventsQuery,
  GqlChain,
  GqlPoolAddRemoveEventV3,
  GqlPoolLiquidityBootstrappingV3,
  GqlPoolSwapEventV3,
} from '@repo/lib/shared/services/api/generated/graphql'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { formatDistanceToNow, secondsToMilliseconds } from 'date-fns'
import { ArrowRight, ArrowUpRight } from 'react-feather'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { isEmpty } from 'lodash'
import { getBlockExplorerTxUrl } from '@repo/lib/shared/utils/blockExplorer'
import { usePool } from '../PoolProvider'
import { PoolEventItem } from '../usePoolEvents'
import { Address } from 'viem'

type PoolEventRowProps = {
  poolEvent: PoolEventItem
  usdValue: string
  chain: GqlChain
  txUrl: string
  projectTokenAddress: Address
  projectTokenLogo: string | undefined
}

type EventType = 'Buy' | 'Sell' | 'Seed' | 'Extract'

const GRID_COLUMNS = '1fr 2fr 1fr 1fr'

export function MyTransactions({
  userPoolEvents,
  isLoading,
}: {
  userPoolEvents: GetPoolEventsQuery['poolEvents'] | undefined
  isLoading: boolean
}) {
  const { toCurrency } = useCurrency()

  const { chain, pool } = usePool()
  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3

  const projectToken = pool.poolTokens[lbpPool.projectTokenIndex]

  return (
    <Card>
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
                  textAlign={index < 2 ? 'left' : 'right'}
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
            {!userPoolEvents || isEmpty(userPoolEvents) ? (
              <>
                <Text variant="secondary">No recent transactions</Text>
                <Text variant="secondary">
                  Note: Recent transactions may take a few minutes to display here.
                </Text>
              </>
            ) : (
              userPoolEvents.map(event => (
                <PoolEventRow
                  chain={chain}
                  key={event.id}
                  poolEvent={event}
                  projectTokenAddress={projectToken.address as Address}
                  projectTokenLogo={projectToken.logoURI || undefined}
                  txUrl={getBlockExplorerTxUrl(event.tx, event.chain)}
                  usdValue={toCurrency(event.valueUSD)}
                />
              ))
            )}
          </Box>
        </VStack>
      )}
    </Card>
  )
}

function Action({ poolEventType }: { poolEventType: EventType }) {
  if (!poolEventType) return null

  const eventTypeColor =
    poolEventType === 'Buy' || poolEventType === 'Seed' ? 'green.500' : 'red.500'

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

function PoolEventRow({
  poolEvent,
  usdValue,
  chain,
  txUrl,
  projectTokenAddress,
  projectTokenLogo,
}: PoolEventRowProps) {
  if (!['GqlPoolSwapEventV3', 'GqlPoolAddRemoveEventV3'].includes(poolEvent.__typename)) {
    return null
  }

  let eventType: EventType
  if (poolEvent.type === 'SWAP') {
    const swapEvent = poolEvent as GqlPoolSwapEventV3
    eventType = swapEvent.tokenOut.address === projectTokenAddress ? 'Buy' : 'Sell'
  } else if (poolEvent.type === 'ADD') {
    eventType = 'Seed'
  } else {
    eventType = 'Extract'
  }

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
        <Action poolEventType={eventType} />
      </GridItem>

      <GridItem area="tokens">
        {poolEvent.type === 'SWAP' ? (
          <SwapTokens
            chain={chain}
            event={poolEvent as GqlPoolSwapEventV3}
            eventType={eventType}
            projectTokenIconUrl={projectTokenLogo}
          />
        ) : (
          <AddOrRemoveTokens chain={chain} event={poolEvent as GqlPoolAddRemoveEventV3} />
        )}
      </GridItem>

      <GridItem area="value" textAlign={{ base: 'right', md: 'right' }}>
        <Text>{usdValue}</Text>
      </GridItem>

      <GridItem area="time" mr="sm">
        <HStack gap="1" justifyContent="flex-end">
          <Text color="grayText" textAlign="right">
            {formatDistanceToNow(new Date(secondsToMilliseconds(poolEvent.timestamp)), {
              addSuffix: true,
            })}
          </Text>
          <Link color="grayText" href={txUrl} isExternal>
            <ArrowUpRight size={16} />
          </Link>
        </HStack>
      </GridItem>
    </Grid>
  )
}

function SwapTokens({
  event,
  chain,
  eventType,
  projectTokenIconUrl,
}: {
  event: GqlPoolSwapEventV3
  chain: GqlChain
  eventType: EventType
  projectTokenIconUrl: string | null | undefined
}) {
  const tokenIn = event.tokenIn
  const tokenOut = event.tokenOut
  const tokenInLogoUrl = eventType === 'Sell' ? projectTokenIconUrl : undefined
  const tokenOutLogoUrl = eventType === 'Buy' ? projectTokenIconUrl : undefined
  return (
    <HStack>
      <HStack gap={['xs', 'sm']} mb="sm">
        <TokenIcon
          address={tokenIn.address}
          alt={tokenIn.address}
          chain={chain}
          logoURI={tokenInLogoUrl}
          size={24}
        />
        <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {fNum('token', tokenIn.amount)}
        </Text>

        <Text color="font.secondary" fontSize="md" fontWeight="700" verticalAlign="top">
          <ArrowRight size={14} />
        </Text>

        <TokenIcon
          address={event.tokenOut.address}
          alt={event.tokenOut.address}
          chain={chain}
          logoURI={tokenOutLogoUrl}
          size={24}
        />
        <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {fNum('token', tokenOut.amount)}
        </Text>
      </HStack>
    </HStack>
  )
}

function AddOrRemoveTokens({ event, chain }: { event: GqlPoolAddRemoveEventV3; chain: GqlChain }) {
  return (
    <HStack>
      <HStack gap={['xs', 'sm']} mb="sm">
        <TokenIcon
          address={event.tokens[0].address}
          alt={event.tokens[0].address}
          chain={chain}
          size={24}
        />
        <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {fNum('token', event.tokens[0].amount)}
        </Text>

        <TokenIcon
          address={event.tokens[1].address}
          alt={event.tokens[1].address}
          chain={chain}
          size={24}
        />
        <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {fNum('token', event.tokens[1].amount)}
        </Text>
      </HStack>
    </HStack>
  )
}
