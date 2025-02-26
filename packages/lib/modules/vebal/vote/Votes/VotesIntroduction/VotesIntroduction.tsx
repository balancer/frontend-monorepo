import { Heading, HStack, VStack, Text } from '@chakra-ui/react'
import { VotingDeadline } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/VotingDeadline'

export function VotesIntroduction() {
  return (
    <HStack>
      <VStack>
        <Heading>Vote and earn external incentives</Heading>
        <Text>
          Voting on pool gauges helps to direct weekly BAL liquidity mining incentives. Voters are
          also eligible to earn additional 3rd party voting incentives.{' '}
        </Text>
      </VStack>
      <VotingDeadline />
    </HStack>
  )
}
