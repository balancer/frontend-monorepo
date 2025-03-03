'use client'

import { HStack, Text, VStack } from '@chakra-ui/react'
import { VotingDeadlineCalendar } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/VotingDeadlineCalendar'
import { VotingDeadlineCounter } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/VotingDeadlineCounter'

export function VotingDeadline() {
  return (
    <VStack bg="background.level3" p={{ base: 'ms', lg: '20px' }} rounded="2xl" spacing="16px">
      <Text
        alignSelf="start"
        color="font.secondary"
        fontSize="16px"
        fontWeight={700}
        letterSpacing="-0.48px"
        lineHeight="20px"
        px="xs"
      >
        Weekly voting deadline
      </Text>
      <HStack flexDirection={{ base: 'column', lg: 'row' }} spacing="20px">
        <VotingDeadlineCalendar />
        <VotingDeadlineCounter />
      </HStack>
    </VStack>
  )
}
