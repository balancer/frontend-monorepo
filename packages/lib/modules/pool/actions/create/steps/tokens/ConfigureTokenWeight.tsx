import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { Text, HStack, Divider, Icon, Box, VStack } from '@chakra-ui/react'
import { AlertTriangle } from 'react-feather'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'

export function TokenWeightInput({
  tokenWeightValue,
  isInvalid,
  isDisabled,
  index,
}: {
  tokenWeightValue: string | undefined
  isDisabled: boolean
  isInvalid: boolean
  index: number
}) {
  const { updatePoolToken } = usePoolCreationForm()

  return (
    <VStack align="start" spacing="sm">
      <Text>Weight</Text>
      <Box position="relative" w="20">
        <InputWithError
          isDisabled={isDisabled}
          isInvalid={isInvalid}
          name="weight"
          onChange={e => {
            updatePoolToken(index, { weight: e.target.value })
          }}
          placeholder="0"
          value={tokenWeightValue}
        />
        <Text
          color="font.secondary"
          opacity={isDisabled ? 0.3 : 1}
          position="absolute"
          right="3"
          top="2.5"
          zIndex={1}
        >
          %
        </Text>
      </Box>
    </VStack>
  )
}

export function TotalWeightDisplay() {
  const { totalWeight, isTotalWeightTooLow, isTotalWeightTooHigh } = usePoolCreationForm()

  const isInvalidTotalWeight = isTotalWeightTooLow || isTotalWeightTooHigh

  const totalWeightColor = isTotalWeightTooLow
    ? 'font.warning'
    : isTotalWeightTooHigh
      ? 'font.error'
      : 'font.maxContrast'

  return (
    <>
      <Divider />
      <HStack justify="space-between" w="full">
        <Text color={totalWeightColor} fontWeight="bold">
          Total
        </Text>
        <HStack>
          {isInvalidTotalWeight && (
            <Icon as={AlertTriangle} boxSize="18px" color={totalWeightColor} />
          )}
          <Text color={totalWeightColor} fontWeight="bold">
            {totalWeight}
          </Text>
          <Text color="font.secondary">%</Text>
        </HStack>
      </HStack>
    </>
  )
}

export function InvalidWeightInputAlert() {
  return (
    <HStack spacing="sm" w="full">
      <Icon as={AlertTriangle} boxSize="18px" color="font.error" />
      <Text color="font.error" fontSize="sm" fontWeight="semibold" textAlign="start" w="full">
        Minimum weight for each token is 1%
      </Text>
    </HStack>
  )
}
