import { ListItem, OrderedList, Text, VStack } from '@chakra-ui/react'

export function HowToParticipate() {
  return (
    <VStack align="flex-start" flex="1" pr="15%" spacing="4">
      <Text
        background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
        backgroundClip="text"
        fontSize="xl"
        fontWeight="bold"
      >
        How to Participate
      </Text>
      <OrderedList pl="4" spacing="3" width="full">
        <ListItem>
          <Text fontWeight="bold">Create a maBEETS Position</Text>
          <Text variant="secondary">
            Deposit BEETS and stS to create a maBEETS position that tracks maturity and governance
            power.
          </Text>
        </ListItem>
        <ListItem>
          <Text fontWeight="bold">Earn Maturity Over Time</Text>
          <Text variant="secondary">
            Your position gains maturity as it is held, increasing voting power and reward share.
          </Text>
        </ListItem>
        <ListItem>
          <Text fontWeight="bold">Participate in Governance & Earn</Text>
          <Text variant="secondary">
            Vote on governance decisions, direct emissions, and earn governance-aligned rewards.
          </Text>
        </ListItem>
      </OrderedList>
    </VStack>
  )
}
