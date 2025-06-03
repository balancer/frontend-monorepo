'use client'

import { Stack, VStack, Card, Grid, GridItem } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PoolActivity } from '../PoolDetail/PoolActivity/PoolActivity'
import { PoolComposition } from '../PoolDetail/PoolComposition'
import { PoolInfoLayout } from '../PoolDetail/PoolInfo/PoolInfoLayout'
import { useUserPoolEvents } from '../useUserPoolEvents'
import { LbpHeader } from './LbpHeader/LbpHeader'

export function LbpDetail() {
  const userEvents = useUserPoolEvents()
  const {
    // TODO: implement
    // userPoolEvents,
    // isLoadingUserPoolEvents,
    hasPoolEvents: userHasPoolEvents,
  } = userEvents || {}

  return (
    <>
      <LbpHeader />
      <DefaultPageContainer noVerticalPadding pb="xl" pt={['lg', '40px']}>
        <VStack spacing="2xl" w="full">
          <Grid templateColumns={{ base: '1fr', md: '3fr 2fr' }} gap="4" w="full">
            <GridItem>
              <Card h="250px">Charts</Card>
            </GridItem>
            <GridItem>
              <Card h="250px">Swap</Card>
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
          <PoolActivity showTabs={false} />
          <PoolComposition />
          <PoolInfoLayout />
        </VStack>
      </DefaultPageContainer>
    </>
  )
}
