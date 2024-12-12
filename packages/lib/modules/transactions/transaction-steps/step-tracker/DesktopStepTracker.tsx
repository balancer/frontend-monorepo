'use client'

import { Card, Box, Divider, HStack, Heading, VStack } from '@chakra-ui/react'
import { Steps } from './Steps'
import { GasPriceCard } from '@repo/lib/shared/hooks/useGasPrice'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { TransactionStepsResponse } from '../useTransactionSteps'

type Props = {
  chain: GqlChain
  transactionSteps: TransactionStepsResponse
  isTxBatch?: boolean
}

export function DesktopStepTracker({ chain, transactionSteps, isTxBatch }: Props) {
  return (
    <Card padding={0} position="absolute" right="-274px" width="250px">
      <VStack alignItems="flex-start" w="full">
        <HStack justify="space-between" p="sm" pb="0" w="full">
          <Heading fontWeight="bold" size="h6">
            Steps
          </Heading>
          <GasPriceCard chain={chain} />
        </HStack>

        <Divider p="0" />
        <Box p="sm" pb="md">
          <Steps isTxBatch={isTxBatch} transactionSteps={transactionSteps} />
        </Box>
      </VStack>
    </Card>
  )
}
