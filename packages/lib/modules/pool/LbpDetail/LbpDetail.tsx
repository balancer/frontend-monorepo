'use client'

import { Stack, VStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PoolActivity } from '../PoolDetail/PoolActivity/PoolActivity'
import { PoolComposition } from '../PoolDetail/PoolComposition'
import { PoolInfoLayout } from '../PoolDetail/PoolInfo/PoolInfoLayout'
import { useUserPoolEvents } from '../useUserPoolEvents'

export function LbpDetail() {
  const userEvents = useUserPoolEvents()
  const {
    // TODO: implement
    // userPoolEvents,
    // isLoadingUserPoolEvents,
    hasPoolEvents: userHasPoolEvents,
  } = userEvents || {}

  return (
    <DefaultPageContainer>
      <VStack spacing="2xl" w="full">
        <VStack spacing="md" w="full"></VStack>
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
  )
}
