import { Stack, VStack, Card, Grid, GridItem } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PoolActivity } from '../PoolDetail/PoolActivity/PoolActivity'
import { PoolComposition } from '../PoolDetail/PoolComposition'
import { PoolInfoLayout } from '../PoolDetail/PoolInfo/PoolInfoLayout'
import { useUserPoolEvents } from '../useUserPoolEvents'
import { LbpHeader } from './LbpHeader/LbpHeader'
import { usePool } from '../PoolProvider'
import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'
import { now } from '@repo/lib/shared/utils/time'
import { isAfter, isBefore, secondsToMilliseconds } from 'date-fns'
import { Top10Holdings } from './Top10Holdings'
import { LbpPoolChartsContainer } from './LbpPoolChartsContainer'

export function LbpDetail() {
  const userEvents = useUserPoolEvents()
  const {
    // TODO: implement
    // userPoolEvents,
    // isLoadingUserPoolEvents,
    hasPoolEvents: userHasPoolEvents,
  } = userEvents || {}

  const { pool } = usePool()
  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3

  return (
    <>
      <LbpHeader />
      <DefaultPageContainer noVerticalPadding pb="xl" pt={['lg', '40px']}>
        <VStack spacing="2xl" w="full">
          <Grid gap="4" templateColumns={{ base: '1fr', md: '2fr 1fr' }} w="full">
            <GridItem>
              <LbpPoolChartsContainer />
            </GridItem>
            <GridItem>
              {isAfter(now(), secondsToMilliseconds(lbpPool.endTime)) ? (
                <Top10Holdings chain={pool.chain} />
              ) : (
                <Card h="250px">Swap</Card>
              )}
            </GridItem>
          </Grid>
          {userHasPoolEvents && (
            <Stack
              direction={{ base: 'column', xl: 'row' }}
              justifyContent="stretch"
              spacing="md"
              w="full"
            ></Stack>
          )}
          {!isBefore(now(), secondsToMilliseconds(lbpPool.startTime)) && (
            <PoolActivity showTabs={false} />
          )}
          <PoolComposition />
          <PoolInfoLayout />
        </VStack>
      </DefaultPageContainer>
    </>
  )
}
