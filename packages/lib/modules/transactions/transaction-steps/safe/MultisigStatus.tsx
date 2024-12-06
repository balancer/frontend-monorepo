import { Button, Card, HStack, Text, VStack } from '@chakra-ui/react'
import { SupportedChainId } from '@repo/lib/config/config.types'
import { GatewayTransactionDetails } from '@safe-global/safe-apps-sdk'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'
import { Hex } from 'viem'
import {
  getRemainingSignaturesLabel,
  getSafeWebUrl,
  getSignConfirmationsLabel,
  hasSomePendingNestedTxInBatch,
} from './safe.helpers'
import { TransactionStep } from '../lib'

type MultisigProps = {
  safeTxHash: Hex
  details: GatewayTransactionDetails
  chainId: SupportedChainId
  currentStep: TransactionStep
}
export function MultisigStatus({ chainId, safeTxHash, details, currentStep }: MultisigProps) {
  if (details.detailedExecutionInfo?.type !== 'MULTISIG') return null
  const safeTxStatus = details.txStatus

  const isAwaitingConfirmations = safeTxStatus === 'AWAITING_CONFIRMATIONS'
  const isCancelled = safeTxStatus === 'CANCELLED'

  const isTxBatch = hasSomePendingNestedTxInBatch(currentStep)

  return (
    <Card backgroundColor="font.special" variant="modalSubSection">
      <VStack align="start" fontSize="sm" mb="sm" spacing="sm" w="full">
        <Text color="font.primaryGradient" fontSize="md">
          {isTxBatch ? 'Transaction bundle status' : 'Multisig status'}
        </Text>

        {isAwaitingConfirmations ? (
          <HStack>
            <Text color="grayText">{getSignConfirmationsLabel(details)}</Text>
            <Text color="font.primary">{getRemainingSignaturesLabel(details)}</Text>
          </HStack>
        ) : (
          <HStack>
            <Text color="grayText">{getSignConfirmationsLabel(details)}</Text>
            <Text color="font.primary">Enough signatures</Text>
          </HStack>
        )}

        {isCancelled && <Text color="grayText">The transaction was cancelled</Text>}
      </VStack>
      <Button
        as={NextLink}
        href={getSafeWebUrl(chainId, safeTxHash, details)}
        rightIcon={<ArrowUpRight size="14" />}
        target="_blank"
        variant="secondary"
      >
        {isTxBatch ? 'View transaction bundle in Safe App' : 'View transaction in Safe App'}
      </Button>
    </Card>
  )
}
