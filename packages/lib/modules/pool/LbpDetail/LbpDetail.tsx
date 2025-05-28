'use client'

import { Stack, VStack, Card } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PoolActivity } from '../PoolDetail/PoolActivity/PoolActivity'
import { PoolComposition } from '../PoolDetail/PoolComposition'
import { PoolInfoLayout } from '../PoolDetail/PoolInfo/PoolInfoLayout'
import { useUserPoolEvents } from '../useUserPoolEvents'
import { LbpHeader } from './LbpHeader'

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
      <DefaultPageContainer noVerticalPadding>
        <VStack spacing="2xl" w="full" mt="2xl">
          <Stack
            direction={{ base: 'column', md: 'row' }}
            justifyContent="stretch"
            spacing="md"
            w="full"
          >
            <Card w="75%" h="250px">
              Charts
            </Card>
            <Card w="25%" h="250px">
              Swap
            </Card>
          </Stack>
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
