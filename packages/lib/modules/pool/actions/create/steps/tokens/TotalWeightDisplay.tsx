import { Divider, HStack, Text } from '@chakra-ui/react'
import { useValidatePoolConfig } from '../../useValidatePoolConfig'
import { AlertTriangle } from 'react-feather'
import { Icon } from '@chakra-ui/icons'

export function TotalWeightDisplay() {
  const { totalWeight, isTotalWeightTooLow, isTotalWeightTooHigh } = useValidatePoolConfig()

  const isInvalidTotalWeight = isTotalWeightTooLow || isTotalWeightTooHigh

  let totalWeightColor = 'font.maxContrast'
  if (isTotalWeightTooLow) totalWeightColor = 'font.warning'
  if (isTotalWeightTooHigh) totalWeightColor = 'font.error'

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
