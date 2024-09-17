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
      <StepIndicator transaction={transaction} {...props}></StepIndicator>
      <VStack spacing="0" alignItems="start">
        <Text mt={isActive ? -0.3 : 0} color={color}>
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
        value={100}
        trackColor="border.base"
        thickness="8"
        size="7"
        color="font.highlight"
      >
        <CircularProgressLabel fontSize="md" color="font.highlight" pl={1.5}>
          <Check size={15} strokeWidth={4} />
        </CircularProgressLabel>
      </CircularProgress>
    )
  }

  return (
    <CircularProgress
      value={100}
      isIndeterminate={isActiveLoading}
      trackColor="border.base"
      thickness="8"
      size="7"
      color={color}
    >
      <CircularProgressLabel fontSize="sm" fontWeight="bold" color={color}>
        {stepNumber}
      </CircularProgressLabel>
    </CircularProgress>
  )
}
