'use client'

import { Card, Box, Divider, HStack, Heading, VStack } from '@chakra-ui/react'
import { Steps } from './Steps'
import { GasPriceCard } from '@/lib/shared/hooks/useGasPrice'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { TransactionStepsResponse } from '../useTransactionSteps'

type Props = {
  chain: GqlChain
  transactionSteps: TransactionStepsResponse
}

export function DesktopStepTracker({ chain, transactionSteps }: Props) {
  return (
    <Card padding={0} position="absolute" right="-224px" width="200px">
      <VStack alignItems="flex-start" w="full">
        <HStack justify="space-between" p="sm" pb="0" w="full">
          <Heading fontWeight="bold" size="h6">
            Steps
          </Heading>
          <GasPriceCard chain={chain} />
        </HStack>

        <Divider p="0" />
        <Box p="sm" pb="md">
          <Steps transactionSteps={transactionSteps} />
        </Box>
      </VStack>
    </Card>
  )
}
