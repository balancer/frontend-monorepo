import { Card, Heading, List, ListItem, Text, VStack } from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'

export function OtherSaleDetails({
  launchTokenSymbol,
  fee,
  userActions,
}: {
  launchTokenSymbol: string
  fee: number
  userActions: string
}) {
  return (
    <Card>
      <VStack spacing="4">
        <Heading size="md" textAlign="left" w="full">
          Other sale details
        </Heading>

        <VStack gap="0" w="full">
          <Text align="left" fontWeight="bold" w="full">
            Token creator rights
          </Text>
          <List
            listStylePosition="outside"
            listStyleType="disc"
            pl="md"
            variant="secondary"
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

        <VStack gap="0" w="full">
          <Text align="left" fontWeight="bold" w="full">
            User rights
          </Text>
          <List
            listStylePosition="outside"
            listStyleType="disc"
            pl="md"
            variant="secondary"
            w="full"
          >
            <ListItem>{`Ability to ${userActions.replaceAll('_', ' ')} ${launchTokenSymbol} during the LBP`}</ListItem>
            <ListItem>{`Immediate access to ${launchTokenSymbol} on swap (no claiming delay or vesting)`}</ListItem>
          </List>
        </VStack>

        <VStack gap="0" w="full">
          <Text align="left" fontWeight="bold" w="full">
            Fees
          </Text>
          <List
            listStylePosition="outside"
            listStyleType="disc"
            pl="md"
            variant="secondary"
            w="full"
          >
            <ListItem>Swap fees: {fNum('feePercent', fee / 100)}</ListItem>
          </List>
        </VStack>
      </VStack>
    </Card>
  )
}
