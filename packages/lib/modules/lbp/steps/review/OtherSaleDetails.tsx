import { Card, Heading, List, Text, VStack } from '@chakra-ui/react';
import { UserActions } from '@repo/lib/modules/lbp/lbp.types'
import { fNum } from '@repo/lib/shared/utils/numbers'

export function OtherSaleDetails({
  launchTokenSymbol,
  fee,
  userActions }: {
  launchTokenSymbol: string
  fee: number
  userActions: UserActions
}) {
  return (
    <Card.Root>
      <VStack gap="4">
        <Heading size="md" textAlign="left" w="full">
          Other sale details
        </Heading>

        <VStack gap="0" w="full">
          <Text align="left" fontWeight="bold" w="full">
            Token creator rights
          </Text>
          <List.Root
            listStylePosition="outside"
            listStyleType="disc"
            pl="md"
            variant="secondary"
            w="full"
          >
            <List.Item>Cancel sale (before start)</List.Item>
            <List.Item>Pause sale (during LBP)</List.Item>
            <List.Item>Unpause sale (during LBP)</List.Item>
            <List.Item>
              Non-editable metadata (before and during sale): Token address, sale liquidity
            </List.Item>
          </List.Root>
        </VStack>

        <VStack gap="0" w="full">
          <Text align="left" fontWeight="bold" w="full">
            User rights
          </Text>
          <List.Root
            listStylePosition="outside"
            listStyleType="disc"
            pl="md"
            variant="secondary"
            w="full"
          >
            <List.Item>{`Ability to ${userActions.replaceAll('_', ' ')} ${launchTokenSymbol} during the LBP`}</List.Item>
            <List.Item>{`Immediate access to ${launchTokenSymbol} on swap (no claiming delay or vesting)`}</List.Item>
          </List.Root>
        </VStack>

        <VStack gap="0" w="full">
          <Text align="left" fontWeight="bold" w="full">
            Fees
          </Text>
          <List.Root
            listStylePosition="outside"
            listStyleType="disc"
            pl="md"
            variant="secondary"
            w="full"
          >
            <List.Item>Swap fees: {fNum('feePercent', fee / 100)}</List.Item>
          </List.Root>
        </VStack>
      </VStack>
    </Card.Root>
  );
}
