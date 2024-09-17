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
    <Card padding={0} width="200px" right="-224px" position="absolute">
      <VStack alignItems="flex-start" w="full">
        <HStack p="sm" pb="0" justify="space-between" w="full">
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
