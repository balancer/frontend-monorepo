import { Card, Heading, HStack, Progress, Stack, Text, VStack } from '@chakra-ui/react'
import { VeBalSectionHeader } from './VeBalSectionHeader'
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
      <VeBalSectionHeader
        after={
          <Heading as="h3" size="md" variant="special">
            {formatPercentage(progressPercentage)}%
          </Heading>
        }
        before={
          <Heading as="h3" size="md" variant="special">
            My veBAL potential
          </Heading>
        }
      />
      <Card m="md" p="lg" position="relative" w="full">
        <Stack direction="row" justifyContent="space-between" mb={2} w="full">
          <Text fontSize="sm">Current veBAL: {formatUserVebal(userStats)}</Text>
          <Text fontSize="sm">Potential veBAL: {formattedPotentialVeBal}</Text>
        </Stack>
        <HStack>
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
