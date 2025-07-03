import { Card, Heading, List, ListItem, Text, VStack } from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'

export function OtherSaleDetails({
  launchTokenSymbol,
  fee,
}: {
  launchTokenSymbol: string
  fee: number
}) {
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
            <ListItem>Unpause sale (during LBP)</ListItem>
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
            <ListItem>{`Immediate access to ${launchTokenSymbol} on swap (no claiming delay or vesting)`}</ListItem>
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
              Swap fees: {fNum('feePercent', fee / 100)}
              <List color="font.secondary" listStylePosition="outside" listStyleType="disc" pl="md">
                <ListItem>To you (LBP creator): {fNum('feePercent', fee / 200)}</ListItem>
                <ListItem>To balancer protocol: {fNum('feePercent', fee / 200)}</ListItem>
              </List>
            </ListItem>
          </List>
        </VStack>
      </VStack>
    </Card>
  )
}
