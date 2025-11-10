import { Grid, GridItem, Text, Box, HStack, Link } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import {
  GetPoolEventsQuery,
  GqlChain,
  GqlPoolAddRemoveEventV3,
  GqlPoolLiquidityBootstrappingV3,
  GqlPoolSwapEventV3,
} from '@repo/lib/shared/services/api/generated/graphql'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { secondsToMilliseconds } from 'date-fns'
import { ArrowRight, ArrowUpRight } from 'react-feather'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { isEmpty } from 'lodash'
import { getBlockExplorerTxUrl } from '@repo/lib/shared/utils/blockExplorer'
import { usePool } from '../PoolProvider'
import { PoolEventItem } from '../usePoolEvents'
import { Address } from 'viem'
import { formatDistanceToNowAbbr } from '@repo/lib/shared/utils/time'
import { PoolTransactionsCard } from '../PoolTransactionsCard'

type PoolEventRowProps = {
  poolEvent: PoolEventItem
  usdValue: string
  chain: GqlChain
  txUrl: string
  projectTokenAddress: Address
  tokenLogoURIs: Record<string, string>
}

type EventType = 'Buy' | 'Sell' | 'Seed' | 'Extract'

const GRID_COLUMNS = '1fr 4fr 1fr 3fr'

export function MyTransactions({
  userPoolEvents,
  isLoading,
}: {
  userPoolEvents: GetPoolEventsQuery['poolEvents'] | undefined
  isLoading: boolean
}) {
  const { toCurrency } = useCurrency()

  const { chain, pool, myLbpTransactionsSectionRef } = usePool()
  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3

  const projectToken = lbpPool.poolTokens[lbpPool.projectTokenIndex]
  const reserveToken = lbpPool.poolTokens[lbpPool.reserveTokenIndex]

  const tokenLogoURIs: Record<string, string> = {
    [projectToken.address]: projectToken.logoURI || '',
    [reserveToken.address]: reserveToken.logoURI || '',
  }

  const isEmptyState = !userPoolEvents || isEmpty(userPoolEvents)

  return (
    <PoolTransactionsCard
      cardProps={{ maxH: '400px' }}
      cardRef={myLbpTransactionsSectionRef}
      hasNoTransactions={isEmptyState}
      headerTemplateColumns={GRID_COLUMNS}
      isLoading={isLoading}
      listContainerProps={{
        maxH: { base: '200px', md: '250px' },
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
      title="My transactions"
    >
      {!isEmptyState &&
        userPoolEvents?.map(event => (
          <PoolEventRow
            chain={chain}
            key={event.id}
            poolEvent={event}
            projectTokenAddress={projectToken.address as Address}
            tokenLogoURIs={tokenLogoURIs}
            txUrl={getBlockExplorerTxUrl(event.tx, event.chain)}
            usdValue={toCurrency(event.valueUSD)}
          />
        ))}
    </PoolTransactionsCard>
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
  tokenLogoURIs,
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
            tokenLogoURIs={tokenLogoURIs}
          />
        ) : (
          <AddOrRemoveTokens
            chain={chain}
            event={poolEvent as GqlPoolAddRemoveEventV3}
            tokenLogoURIs={tokenLogoURIs}
          />
        )}
      </GridItem>

      <GridItem area="value" textAlign={{ base: 'right', md: 'right' }}>
        <Text>{usdValue}</Text>
      </GridItem>

      <GridItem area="time" mr="sm">
        <HStack gap="1" justifyContent="flex-end">
          <Text color="grayText" textAlign="right">
            {formatDistanceToNowAbbr(new Date(secondsToMilliseconds(poolEvent.timestamp)))}
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
  tokenLogoURIs,
}: {
  event: GqlPoolSwapEventV3
  chain: GqlChain
  tokenLogoURIs: Record<string, string>
}) {
  const tokenIn = event.tokenIn
  const tokenOut = event.tokenOut

  return (
    <HStack>
      <HStack gap={['xs', 'sm']} mb="sm">
        <TokenIcon
          address={tokenIn.address}
          alt={tokenIn.address}
          chain={chain}
          logoURI={tokenLogoURIs[tokenIn.address]}
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
          logoURI={tokenLogoURIs[tokenOut.address]}
          size={24}
        />
        <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {fNum('token', tokenOut.amount)}
        </Text>
      </HStack>
    </HStack>
  )
}

function AddOrRemoveTokens({
  event,
  chain,
  tokenLogoURIs,
}: {
  event: GqlPoolAddRemoveEventV3
  chain: GqlChain
  tokenLogoURIs: Record<string, string>
}) {
  return (
    <HStack>
      <HStack gap={['xs', 'sm']} mb="sm">
        <TokenIcon
          address={event.tokens[0].address}
          alt={event.tokens[0].address}
          chain={chain}
          logoURI={tokenLogoURIs[event.tokens[0].address]}
          size={24}
        />
        <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {fNum('token', event.tokens[0].amount)}
        </Text>
        <TokenIcon
          address={event.tokens[1].address}
          alt={event.tokens[1].address}
          chain={chain}
          logoURI={tokenLogoURIs[event.tokens[1].address]}
          size={24}
        />
        <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {fNum('token', event.tokens[1].amount)}
        </Text>
      </HStack>
    </HStack>
  )
}
