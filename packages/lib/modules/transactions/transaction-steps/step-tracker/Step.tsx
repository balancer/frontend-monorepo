import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  HStack,
  Text,
  VStack,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from '@chakra-ui/react'
import { StepProps, getStepSettings } from './getStepSettings'
import { ArrowUpRight, Check } from 'react-feather'
import { ManagedResult, StepDetails, TransactionStep } from '../lib'
import { indexToLetter } from '@repo/lib/shared/labels'
import { getPendingNestedSteps, hasSomePendingNestedTxInBatch } from '../safe/safe.helpers'
import { useTransactionGasCost } from '../useTransactionGasCost'
import { getBlockExplorerTxUrl } from '@repo/lib/shared/utils/blockExplorer'
import { getGqlChain } from '@repo/lib/config/app.config'
import { SMALL_AMOUNT_LABEL } from '@repo/lib/shared/utils/numbers'
import { SpeedIcon } from '@repo/lib/shared/components/icons/SpeedIcon'

export function Step(props: StepProps) {
  const transaction = props.step.transaction
  const step = props.step
  const { color, isActive, title } = getStepSettings(props, transaction)
  const variant = isActive && !props.lastTransactionConfirmed ? 'special' : 'secondary'

  const shouldDisplayAsTxBatch =
    props.isTxBatch && props.step.isBatchEnd && hasSomePendingNestedTxInBatch(props.step)

  return (
    <HStack alignItems="start" gap="10px">
      <Box mt="4px">
        <StepIndicator transaction={transaction} {...props} />
      </Box>
      <VStack alignItems="start" spacing="0">
        <Text fontWeight="bold" lineHeight="1.05" variant={variant}>
          {shouldDisplayAsTxBatch ? 'Safe transaction bundle' : title}
        </Text>
        {!shouldDisplayAsTxBatch && (
          <NestedInfo
            color={color}
            details={props.step.details}
            step={step}
            transaction={transaction}
            variant={variant}
          />
        )}
        {shouldDisplayAsTxBatch && (
          <TransactionBatchSteps
            color={color}
            mainStepTitle={props.step.labels.title}
            nestedSteps={getPendingNestedSteps(props.step)}
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
        thickness="5"
        trackColor="border.base"
        value={100}
      >
        <CircularProgressLabel color="font.highlight" fontSize="md" pl={1.5}>
          <Check size={15} strokeWidth={3.5} />
        </CircularProgressLabel>
      </CircularProgress>
    )
  }

  return (
    <CircularProgress
      bg={isActive ? 'background.special' : 'transparent'}
      color={color}
      isIndeterminate={isActiveLoading}
      rounded="full"
      size="7"
      thickness={isActive ? 0 : 5}
      trackColor="border.base"
      value={100}
    >
      <CircularProgressLabel color={color}>
        <Text
          color={isActive ? 'background.level1' : 'font.secondary'}
          fontSize="sm"
          fontWeight="bold"
          variant="special"
        >
          {stepNumber}
        </Text>
      </CircularProgressLabel>
    </CircularProgress>
  )
}

function NestedInfo({
  color,
  details,
  transaction,
  variant,
  step,
}: {
  color: string
  details?: StepDetails
  transaction?: ManagedResult
  variant?: string
  step: TransactionStep
}) {
  const gasCostData = useTransactionGasCost(transaction)

  const isSmallAmount = gasCostData && gasCostData.costUsd?.replace('$', '') === SMALL_AMOUNT_LABEL
  const isActual = gasCostData && gasCostData.isActual

  const textProps = {
    fontSize: 'sm',
    lineHeight: '1.2',
    variant,
  }

  return (
    <Box mb="0" mt="0" p="0.5" pl="0">
      <HStack align="start" gap="xxs">
        {!details?.gasless && gasCostData && gasCostData.costUsd != null ? (
          <HStack gap="0">
            <Text {...textProps} mr="sm" p="0">
              {isActual ? 'Final gas: ' : 'Estimated gas: '}
              {(!isSmallAmount || !isActual) && '~'}
              {gasCostData.costUsd}
            </Text>
            {!isActual && (
              <Popover placement="top" trigger="hover">
                <PopoverTrigger>
                  <HStack gap="0">
                    <SpeedIcon size={20} />
                    <Text color="grayText" cursor="pointer" fontSize="sm">
                      Slow
                    </Text>
                  </HStack>
                </PopoverTrigger>
                <PopoverContent p="2" shadow="2xl" width="250px" zIndex="popover">
                  <PopoverArrow bg="background.level3" />
                  <Text color="grayText">
                    This estimate assumes a slow speed. A higher gas cost likely means your wallet
                    is set to a faster transaction speed.
                  </Text>
                </PopoverContent>
              </Popover>
            )}
          </HStack>
        ) : step.isComplete() ? (
          <Text {...textProps}>Previously approved</Text>
        ) : (
          <Text {...textProps}>
            {details?.type || (details?.gasless ? 'Signature: Free' : 'Gas transaction')}
          </Text>
        )}
        {transaction?.result.data && (
          <Link
            color="font.secondary"
            href={getBlockExplorerTxUrl(
              transaction?.result?.data?.transactionHash,
              getGqlChain(transaction?.result?.data?.chainId)
            )}
            isExternal
          >
            <ArrowUpRight size={14} />
          </Link>
        )}
      </HStack>

      {details?.batchApprovalTokens &&
        details.batchApprovalTokens.length > 1 &&
        details.batchApprovalTokens.map((token, index) => (
          <HStack key={token} mt={index === 0 ? '2' : '1'}>
            <SubStepIndicator color={color} label={indexToLetter(index)} />
            <Text fontSize="sm" variant={variant}>
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
        nestedSteps?.length >= 1 &&
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
