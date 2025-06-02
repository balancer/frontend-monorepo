import { HStack, Icon, Text, Card, VStack, Grid, GridItem } from '@chakra-ui/react'
import { isLBP } from '@repo/lib/modules/pool/pool.helpers'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { GqlPoolLiquidityBootstrapping } from '@repo/lib/shared/services/api/generated/graphql'
import { format, secondsToMilliseconds } from 'date-fns'
import { Clock } from 'react-feather'

export function LbpHeaderTimeInfo() {
  const { pool } = usePool()

  if (!isLBP(pool.type)) return null

  const lbpPool = pool as GqlPoolLiquidityBootstrapping
  const endTimeFormatted = format(secondsToMilliseconds(lbpPool.endTime), 'haaa MM/dd/yy')

  return (
    <Grid templateColumns="5fr 1fr 2fr" w="full">
      <GridItem
        alignItems="center"
        as="span"
        bg="green.400"
        borderRadius="sm"
        color="black"
        p="2"
        my="12"
      >
        <HStack h="full" w="full" justifyContent="start" alignItems="center">
          <Icon as={Clock} />
          <Text color="black">{`LBP is live! Ends ${endTimeFormatted}`}</Text>
        </HStack>
      </GridItem>
      <GridItem p="2" my="12">
        <Card>
          <VStack>
            <Text>D</Text>
            <Text>4</Text>
          </VStack>
        </Card>
      </GridItem>
      <GridItem p="2" my="12">
        <Card>
          <HStack>
            <VStack>
              <Text>H</Text>
              <Text>12</Text>
            </VStack>
            <VStack>
              <Text>M</Text>
              <Text>12</Text>
            </VStack>
            <VStack>
              <Text>S</Text>
              <Text>12</Text>
            </VStack>
          </HStack>
        </Card>
      </GridItem>
    </Grid>
  )
}
