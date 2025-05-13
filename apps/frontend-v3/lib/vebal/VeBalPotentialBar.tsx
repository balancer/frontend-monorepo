import { Card, Flex, Heading, HStack, Progress, Stack, Text, VStack } from '@chakra-ui/react'
import { fNum, isZero } from '@repo/lib/shared/utils/numbers'
import { formatUserVebal, useVebalUserStats } from './VebalStats/useVeBalUserStats'
import { useMaxAmountOfVeBAL } from './useMaxAmountOfVeBal'
import { VeBalIncreaseButton } from './VeBalLockButtons'

export function VeBalPotentialBar() {
  const { userStats } = useVebalUserStats()
  const veBalBalance = userStats?.balance || 0n
  const { maxAmount, calculateCurrentVeBalPercentage, isSmallerThanCurrentBalance } =
    useMaxAmountOfVeBAL()

  /*
    There are some edge cases (i.e. when the user just locked all their balance for the max duration)
    when the calculated maxAmount can be slightly lower than the current veBAL balance.
    We assume that the user is at 100% in those cases.
  */
  const formattedPotentialVeBal = isSmallerThanCurrentBalance(veBalBalance)
    ? formatUserVebal(userStats)
    : fNum('token', maxAmount)

  const progressPercentage = calculateCurrentVeBalPercentage(veBalBalance)

  if (isZero(maxAmount)) return null

  function formatPercentage(value: number): string {
    if (value < 10) {
      return value.toFixed(2)
    } else {
      return Math.round(value).toString()
    }
  }

  return (
    <VStack spacing="xs" w="full">
      <Flex justifyContent="space-between" w="full">
        <Heading as="h3" pb="0.5" size="md" variant="special">
          Max lock percentage
        </Heading>
        <Heading as="h3" size="md" variant="special">
          {formatPercentage(progressPercentage)}%
        </Heading>
      </Flex>
      <Card m="ms" p={{ base: 'ms', sm: 'md', md: 'lg' }} position="relative" w="full">
        <Stack direction="row" justifyContent="space-between" mb={5} w="full">
          <Text fontSize={{ base: 'xs', md: 'sm' }}>
            Current veBAL: {formatUserVebal(userStats)}
          </Text>
          <Text fontSize={{ base: 'xs', md: 'sm' }} variant="special">
            veBAL with 1 year lock: {formattedPotentialVeBal}
          </Text>
        </Stack>
        <HStack gap={{ base: 'md', md: 'lg' }}>
          <Progress
            colorScheme="green"
            rounded="lg"
            size="sm"
            value={progressPercentage}
            w="full"
          />
          {progressPercentage < 100 && <VeBalIncreaseButton size="md" variant="primary" />}
        </HStack>
      </Card>
    </VStack>
  )
}
