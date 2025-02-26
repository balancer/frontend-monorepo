'use client'

import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { VotingDeadlineCalendar } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/VotingDeadlineCalendar'
import { VotingDeadlineCounter } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/VotingDeadlineCounter'

export function VotingDeadline() {
  return (
    <Box>
      <VStack>
        <Text fontWeight="700" variant="secondary">
          Weekly voting deadline
        </Text>
        <HStack>
          <VotingDeadlineCalendar />
          <VotingDeadlineCounter />
        </HStack>
      </VStack>
    </Box>
  )
}
