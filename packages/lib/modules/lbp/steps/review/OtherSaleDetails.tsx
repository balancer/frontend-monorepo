import { Card, Heading, List, ListItem, Text, VStack } from '@chakra-ui/react'

export function OtherSaleDetails({ launchTokenSymbol }: { launchTokenSymbol: string }) {
  return (
    <Card>
      <VStack spacing="4">
        <Heading size="md" textAlign="left" w="full">
          Other sale details
        </Heading>

        <VStack w="full">
          <Text align="left" w="full">
            Token creator rights
          </Text>
          <List
            color="font.secondary"
            listStylePosition="outside"
            listStyleType="disc"
            pl="md"
            w="full"
          >
            <ListItem>Cancel sale (before start)</ListItem>
            <ListItem>Pause sale (during LBP)</ListItem>
            <ListItem>Unpause salse (during LBP)</ListItem>
            <ListItem>
              Non-editable metadata (before and during sale): Token address, sale liquidity
            </ListItem>
          </List>
        </VStack>

        <VStack w="full">
          <Text align="left" w="full">
            User rights
          </Text>
          <List
            color="font.secondary"
            listStylePosition="outside"
            listStyleType="disc"
            pl="md"
            w="full"
          >
            <ListItem>{`Ability to buy and sell ${launchTokenSymbol} during the LBP`}</ListItem>
            <ListItem>{`Inmediate access to ${launchTokenSymbol} on swap (no claiming delay or vesting)`}</ListItem>
          </List>
        </VStack>

        <VStack w="full">
          <Text align="left" w="full">
            Fees
          </Text>
          <List
            color="font.secondary"
            listStylePosition="outside"
            listStyleType="disc"
            pl="md"
            w="full"
          >
            <ListItem>
              Swap fees: 2.00%
              <List color="font.secondary" listStylePosition="outside" listStyleType="disc" pl="md">
                <ListItem>To you (LBP creator): 1.00%</ListItem>
                <ListItem>To balancer protocol: 1.00%</ListItem>
              </List>
            </ListItem>
          </List>
        </VStack>
      </VStack>
    </Card>
  )
}
