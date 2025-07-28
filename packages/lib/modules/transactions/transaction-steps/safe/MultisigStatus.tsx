import { Button, Card, HStack, Text, VStack } from '@chakra-ui/react'
import { SupportedChainId } from '@repo/lib/config/config.types'
import { GatewayTransactionDetails, TransactionStatus } from '@safe-global/safe-apps-sdk'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'
import {
  getRemainingSignaturesLabel,
  getSafeWebUrl,
  getSignConfirmationsLabel,
  hasSomePendingNestedTxInBatch,
} from './safe.helpers'
import { TransactionStep } from '../lib'
import { Address } from 'viem'

type MultisigProps = {
  details: GatewayTransactionDetails
  chainId: SupportedChainId
  currentStep?: TransactionStep
}
export function MultisigStatus({ chainId, details, currentStep }: MultisigProps) {
  if (details.detailedExecutionInfo?.type !== 'MULTISIG') return null
  const safeTxStatus = details.txStatus

  const isSuccess = safeTxStatus === TransactionStatus.SUCCESS
  const isAwaitingConfirmations = safeTxStatus === TransactionStatus.AWAITING_CONFIRMATIONS
  const isCancelled = safeTxStatus === TransactionStatus.CANCELLED
  const isFailed = safeTxStatus === TransactionStatus.FAILED

  const isTxBatch = currentStep ? hasSomePendingNestedTxInBatch(currentStep) : false

  return (
    <Card backgroundColor="font.special" variant="modalSubSection">
      <VStack align="start" fontSize="sm" mb="sm" spacing="sm" w="full">
        <Text color="font.primaryGradient" fontSize="md">
          {isTxBatch ? 'Transaction bundle status' : 'Multisig status'}
        </Text>

        {isAwaitingConfirmations && (
          <HStack>
            <Text color="grayText">{getSignConfirmationsLabel(details)}</Text>
            <Text color="font.primary">{getRemainingSignaturesLabel(details)}</Text>
          </HStack>
        )}
        {isSuccess && (
          <HStack>
            <Text color="grayText">{getSignConfirmationsLabel(details)}</Text>
            <Text color="font.primary">Enough signatures</Text>
          </HStack>
        )}
        {isFailed && <Text color="grayText">Transaction failed</Text>}
        {isCancelled && <Text color="grayText">The transaction was cancelled</Text>}
      </VStack>
      <Button
        as={NextLink}
        href={getSafeWebUrl(chainId, details.safeAddress as Address, details.txId)}
        rightIcon={<ArrowUpRight size="14" />}
        target="_blank"
        variant="secondary"
      >
        {isTxBatch ? 'View transaction bundle in Safe App' : 'View transaction in Safe App'}
      </Button>
    </Card>
  )
}
