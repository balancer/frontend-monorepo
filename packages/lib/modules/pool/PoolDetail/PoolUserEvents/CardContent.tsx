import { Box, Grid, VStack, Heading, Divider, GridItem, Text } from '@chakra-ui/react'
import { PoolEventRow } from '@repo/lib/modules/pool/PoolDetail/PoolUserEvents/PoolEventRow'
import { getBlockExplorerTxUrl } from '@repo/lib/shared/utils/blockExplorer'
import { isEmpty } from 'lodash'
import { PropsWithChildren } from 'react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { PoolEventItem } from '../../usePoolEvents'
import { ActionProps, TokensProps } from './PoolUserEvents'

type CardContentProps = PropsWithChildren<{
  gridColumns: string
  poolEvents: PoolEventItem[]
  tokensComponent: React.FC<TokensProps>
  actionComponent: React.FC<ActionProps>
}>

export function CardContent({
  children,
  gridColumns,
  poolEvents,
  tokensComponent: Tokens,
  actionComponent: Action,
}: CardContentProps) {
  const { toCurrency } = useCurrency()

  return (
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
        <Grid gap="4" templateColumns={{ base: '1fr', md: gridColumns }} w="full">
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
              actionComponent={Action}
              gridColumns={gridColumns}
              key={poolEvent.id}
              poolEvent={poolEvent}
              tokensComponent={Tokens}
              txUrl={getBlockExplorerTxUrl(poolEvent.tx, poolEvent.chain)}
              usdValue={toCurrency(poolEvent.valueUSD)}
            />
          ))
        )}
      </Box>
      {children}
    </VStack>
  )
}
