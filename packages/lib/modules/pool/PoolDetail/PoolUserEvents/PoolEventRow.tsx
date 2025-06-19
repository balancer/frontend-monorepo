import { Grid, Link, GridItem, HStack, Text } from '@chakra-ui/react'
import { PoolEventItem } from '@repo/lib/modules/pool/usePoolEvents'
import { formatDistanceToNow, secondsToMilliseconds } from 'date-fns'
import { ArrowUpRight } from 'react-feather'
import { ActionProps, TokensProps } from './PoolUserEvents'
import { getEventType } from '@repo/lib/modules/pool/pool.utils'

type PoolEventRowProps = {
  poolEvent: PoolEventItem
  usdValue: string
  txUrl: string
  gridColumns: string
  tokensComponent: React.FC<TokensProps>
  actionComponent: React.FC<ActionProps>
}

export function PoolEventRow({
  poolEvent,
  usdValue,
  txUrl,
  gridColumns,
  tokensComponent: Tokens,
  actionComponent: Action,
}: PoolEventRowProps) {
  // Only show add/remove/swap events
  if (!['GqlPoolAddRemoveEventV3', 'GqlPoolSwapEventV3'].includes(poolEvent.__typename)) {
    return null
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
      templateColumns={{ base: 'fit-content(150px) 50px 1fr', md: gridColumns }}
      w="full"
    >
      <GridItem area="action">
        <Action poolEventType={getEventType(poolEvent)} />
      </GridItem>
      <GridItem area="tokens">
        <Tokens chain={poolEvent.chain} poolEvent={poolEvent} />
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
