'use client'

import { HStack, Text, VStack } from '@chakra-ui/react'
import { VotingDeadlineCalendar } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/VotingDeadlineCalendar'
import { VotingDeadlineCounter } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/VotingDeadlineCounter'

export function VotingDeadline() {
  return (
    <VStack p={{ base: 'ms', lg: '20px' }} bg="background.level3" rounded="2xl" spacing="16px">
      <Text
        fontSize="16px"
        color="font.secondary"
        fontWeight={700}
        lineHeight="20px"
        letterSpacing="-0.48px"
        alignSelf="start"
        px="xs"
      >
        Weekly voting deadline
      </Text>
      <HStack spacing="20px" flexDirection={{ base: 'column', lg: 'row' }}>
        <VotingDeadlineCalendar />
        <VotingDeadlineCounter />
      </HStack>
    </VStack>
  )
}
