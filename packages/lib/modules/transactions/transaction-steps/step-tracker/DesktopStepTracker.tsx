'use client'

import { Card, Box, Divider, HStack, Heading, VStack, StyleProps } from '@chakra-ui/react'
import { Steps } from './Steps'
import { GasPriceCard } from '@repo/lib/shared/hooks/useGasPrice'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { TransactionStepsResponse } from '../useTransactionSteps'

type Props = {
  chain: GqlChain
  transactionSteps: TransactionStepsResponse
  isTxBatch?: boolean
  extraStyles?: StyleProps
}

export function DesktopStepTracker({ chain, transactionSteps, isTxBatch, extraStyles }: Props) {
  return (
    <Card padding={0} position="absolute" right="-310px" top="10px" width="290px" {...extraStyles}>
      <VStack alignItems="flex-start" gap="0" w="full">
        <HStack justify="space-between" px="ms" py="sm" w="full">
          <Heading fontWeight="bold" size="h6">
            Steps
          </Heading>
          <GasPriceCard chain={chain} />
        </HStack>

        <Divider p="0" />
        <Box p="ms">
          <Steps isTxBatch={isTxBatch} transactionSteps={transactionSteps} />
        </Box>
      </VStack>
    </Card>
  )
}
