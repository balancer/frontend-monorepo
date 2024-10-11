import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { StepProps, getStepSettings } from './getStepSettings'
import { Check } from 'react-feather'
import { ManagedResult, StepDetails } from '../lib'
import { useTransactionState } from '../TransactionStateProvider'
import { indexToLetter } from '@/lib/shared/labels'

export function Step(props: StepProps) {
  const { getTransaction } = useTransactionState()
  const transaction = getTransaction(props.step.id)
  const { color, isActive, title } = getStepSettings(props, transaction)

  return (
    <HStack alignItems="flex-start">
      <StepIndicator transaction={transaction} {...props}></StepIndicator>
      <VStack spacing="0" alignItems="start">
        <Text mt={isActive ? -0.3 : 0} color={color} fontWeight="bold">
          {title}
        </Text>
        <NestedInfo color={color} details={props.step.details} />
      </VStack>
    </HStack>
  )
}

export function StepIndicator({
  transaction,
  ...props
}: StepProps & { transaction?: ManagedResult }) {
  const { color, isActive, isActiveLoading, status, stepNumber } = getStepSettings(
    props,
    transaction
  )

  if (status === 'complete') {
    return (
      <CircularProgress
        value={100}
        trackColor="border.base"
        thickness="6"
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
      thickness={isActive ? 8 : 6}
      size="7"
      color={color}
    >
      <CircularProgressLabel fontSize="sm" fontWeight="bold" color={color}>
        {stepNumber}
      </CircularProgressLabel>
    </CircularProgress>
  )
}

function NestedInfo({ color, details }: { color: string; details?: StepDetails }) {
  return (
    <Box mt="0" p="1" pl="0" mb="0">
      <Text fontSize="sm" color={color} lineHeight="1">
        {details?.gasless ? 'Free signature' : 'Gas transaction'}
      </Text>

      {details?.batchApprovalTokens &&
        details.batchApprovalTokens.length > 1 &&
        details.batchApprovalTokens.map((token, index) => (
          <HStack mt={index === 0 ? '2' : '1'} key={token}>
            <SubStepIndicator color={color} label={indexToLetter(index)} />
            <Text fontSize="sm" color={color}>
              {token}
            </Text>
          </HStack>
        ))}
    </Box>
  )
}

function SubStepIndicator({ color, label }: { color: string; label: string }) {
  return (
    <CircularProgress value={100} trackColor="border.base" thickness="2" size="6" color={color}>
      <CircularProgressLabel fontSize="xs" fontWeight="bold" color={color}>
        {label}
      </CircularProgressLabel>
    </CircularProgress>
  )
}
