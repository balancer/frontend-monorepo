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
import { ManagedResult, StepDetails, TransactionStep } from '../lib'
import { useTransactionState } from '../TransactionStateProvider'
import { indexToLetter } from '@repo/lib/shared/labels'
import { hasSomePendingNestedTxInBatch } from '../safe/safe.helpers'

export function Step(props: StepProps) {
  const { getTransaction } = useTransactionState()
  const transaction = getTransaction(props.step.id)
  const { color, isActive, title } = getStepSettings(props, transaction)

  const shouldDisplayAsTxBatch =
    props.isTxBatch && props.step.isBatchEnd && hasSomePendingNestedTxInBatch(props.step)

  return (
    <HStack alignItems="flex-start">
      <StepIndicator transaction={transaction} {...props} />
      <VStack alignItems="start" spacing="0">
        <Text color={color} fontWeight="bold" mt={isActive ? -0.3 : 0}>
          {shouldDisplayAsTxBatch ? 'Safe transaction bundle' : title}
        </Text>
        {!shouldDisplayAsTxBatch && <NestedInfo color={color} details={props.step.details} />}
        {shouldDisplayAsTxBatch && (
          <TransactionBatchSteps
            color={color}
            mainStepTitle={props.step.labels.title}
            nestedSteps={props.step.nestedSteps}
          />
        )}
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
        color="font.highlight"
        size="7"
        thickness="6"
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
      thickness={isActive ? 8 : 6}
      trackColor="border.base"
      value={100}
    >
      <CircularProgressLabel color={color} fontSize="sm" fontWeight="bold">
        {stepNumber}
      </CircularProgressLabel>
    </CircularProgress>
  )
}

function NestedInfo({ color, details }: { color: string; details?: StepDetails }) {
  return (
    <Box mb="0" mt="0" p="1" pl="0">
      <Text color={color} fontSize="sm" lineHeight="1">
        {details?.gasless ? 'Free signature' : 'Gas transaction'}
      </Text>

      {details?.batchApprovalTokens &&
        details.batchApprovalTokens.length > 1 &&
        details.batchApprovalTokens.map((token, index) => (
          <HStack key={token} mt={index === 0 ? '2' : '1'}>
            <SubStepIndicator color={color} label={indexToLetter(index)} />
            <Text color={color} fontSize="sm">
              {token}
            </Text>
          </HStack>
        ))}
    </Box>
  )
}

/*
  Displays the status of the transaction steps that will be executed in the same batch in the scenario of a Smart Account (Safe)
  Example: in a batch with 2 token approval steps + 1 add liquidity step, this will display a batch step with the 3 nested steps
    A: Approve token 1
    B: Approve token 2
    C: Add liquidity
*/
function TransactionBatchSteps({
  color,
  mainStepTitle,
  nestedSteps,
}: {
  mainStepTitle?: string
  color: string
  nestedSteps?: TransactionStep[]
}) {
  return (
    <Box mb="0" mt="0" p="1" pl="0">
      <Text color={color} fontSize="sm" lineHeight="1">
        Gas transactions
      </Text>

      {nestedSteps &&
        nestedSteps?.length > 1 &&
        nestedSteps.map((step, index) => (
          <HStack key={step.id} mt={index === 0 ? '2' : '1'}>
            <SubStepIndicator color={color} label={indexToLetter(index)} />
            <Text color={color} fontSize="sm">
              {step.labels.title}
            </Text>
          </HStack>
        ))}
      {mainStepTitle && nestedSteps && (
        <HStack mt="2">
          <SubStepIndicator color={color} label={indexToLetter(nestedSteps?.length)} />
          <Text color={color} fontSize="sm">
            {mainStepTitle}
          </Text>
        </HStack>
      )}
    </Box>
  )
}

function SubStepIndicator({ color, label }: { color: string; label: string }) {
  return (
    <CircularProgress color={color} size="6" thickness="2" trackColor="border.base" value={100}>
      <CircularProgressLabel color={color} fontSize="xs" fontWeight="bold">
        {label}
      </CircularProgressLabel>
    </CircularProgress>
  )
}
