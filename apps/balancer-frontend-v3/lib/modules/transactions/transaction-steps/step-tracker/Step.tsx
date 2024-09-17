import { CircularProgress, CircularProgressLabel, HStack, Text, VStack } from '@chakra-ui/react'
import { StepProps, getStepSettings } from './getStepSettings'
import { Check } from 'react-feather'
import { ManagedResult } from '../lib'
import { useTransactionState } from '../TransactionStateProvider'

export function Step(props: StepProps) {
  const { getTransaction } = useTransactionState()
  const transaction = getTransaction(props.step.id)
  const { color, isActive, title } = getStepSettings(props, transaction)

  return (
    <HStack alignItems="center">
      <StepIndicator transaction={transaction} {...props} />
      <VStack alignItems="start" spacing="0">
        <Text color={color} mt={isActive ? -0.3 : 0}>
          {title}
        </Text>
      </VStack>
    </HStack>
  )
}

export function StepIndicator({
  transaction,
  ...props
}: StepProps & { transaction?: ManagedResult }) {
  const { color, isActiveLoading, status, stepNumber } = getStepSettings(props, transaction)

  if (status === 'complete') {
    return (
      <CircularProgress
        color="font.highlight"
        size="7"
        thickness="8"
        trackColor="border.base"
        value={100}
      >
        <CircularProgressLabel color="font.highlight" fontSize="md" pl={1.5}>
          <Check size={15} strokeWidth={4} />
        </CircularProgressLabel>
      </CircularProgress>
    )
  }

  return (
    <CircularProgress
      color={color}
      isIndeterminate={isActiveLoading}
      size="7"
      thickness="8"
      trackColor="border.base"
      value={100}
    >
      <CircularProgressLabel color={color} fontSize="sm" fontWeight="bold">
        {stepNumber}
      </CircularProgressLabel>
    </CircularProgress>
  )
}
