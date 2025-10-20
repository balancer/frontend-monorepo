import { Stack, VStack, Grid, GridItem } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PoolActivity } from '../PoolDetail/PoolActivity/PoolActivity'
import { PoolComposition } from '../PoolDetail/PoolComposition'
import { PoolInfoLayout } from '../PoolDetail/PoolInfo/PoolInfoLayout'
import { useUserPoolEvents } from '../useUserPoolEvents'
import { LbpHeader } from './LbpHeader/LbpHeader'
import { LbpSwap } from './LbpSwap'
import { usePool } from '../PoolProvider'
import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'
import { now } from '@repo/lib/shared/utils/time'
import { isAfter, isBefore, secondsToMilliseconds } from 'date-fns'
import { LbpPoolChartsContainer } from './LbpPoolCharts/LbpPoolChartsContainer'
import { MyPurchases } from './MyPurchases'
import { MyTransactions } from './MyTransactions'
import { GetFundsWarning } from './GetFundsWarning'
import { Top10Trades } from './Top10Trades'

export function LbpDetail() {
  const { userPoolEvents, isLoadingUserPoolEvents, hasPoolEvents } = useUserPoolEvents()
  const { pool } = usePool()

  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3
  const isSaleFinished = isAfter(now(), secondsToMilliseconds(lbpPool.endTime))
  const fundsAvailable = Number(lbpPool.userBalance?.totalBalance) > 0

  return (
    <>
      <LbpHeader />
      <DefaultPageContainer noVerticalPadding pb="xl" pt={['lg', '40px']}>
        <VStack spacing="2xl" w="full">
          {isSaleFinished && fundsAvailable && <GetFundsWarning />}

          <Grid gap="4" templateColumns={{ base: '1fr', md: '2fr 1fr' }} w="full">
            <GridItem>
              <LbpPoolChartsContainer />
            </GridItem>
            <GridItem minH="400px">
              {isSaleFinished ? <Top10Trades chain={pool.chain} pool={lbpPool} /> : <LbpSwap />}
            </GridItem>
          </Grid>

          {hasPoolEvents && (
            <Stack
              direction={{ base: 'column', xl: 'row' }}
              justifyContent="stretch"
              spacing="md"
              w="full"
            >
              <MyPurchases isLoading={isLoadingUserPoolEvents} userPoolEvents={userPoolEvents} />
              <MyTransactions isLoading={isLoadingUserPoolEvents} userPoolEvents={userPoolEvents} />
            </Stack>
          )}

          {!isBefore(now(), secondsToMilliseconds(lbpPool.startTime)) && <PoolActivity />}
          <PoolComposition />

          <PoolInfoLayout />
        </VStack>
      </DefaultPageContainer>
    </>
  )
}
