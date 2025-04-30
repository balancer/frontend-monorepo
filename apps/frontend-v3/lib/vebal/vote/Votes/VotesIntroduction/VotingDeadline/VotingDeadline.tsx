'use client'

import { HStack, Text, VStack } from '@chakra-ui/react'
import { VotingDeadlineCalendar } from './VotingDeadlineCalendar'
import { VotingDeadlineCounter } from './VotingDeadlineCounter'

export function VotingDeadline() {
  return (
    <VStack
      bg="background.level0"
      p={{ base: 'ms', lg: '20px' }}
      rounded="lg"
      shadow="2xl"
      spacing="16px"
      zIndex="1"
    >
      <Text alignSelf="start" color="font.secondary" opacity={0.8} variant="eyebrow">
        Weekly voting deadline
      </Text>
      <HStack
        align="stretch"
        flexDirection={{ base: 'column', lg: 'row' }}
        spacing={{ base: 'ms', md: 'md', xl: '20px' }}
      >
        <VotingDeadlineCalendar />
        <VotingDeadlineCounter />
      </HStack>
    </VStack>
  )
}
