'use client'

import { Heading, VStack } from '@chakra-ui/react'
import { LbpFormAction } from '../LbpFormAction'

export function ReviewStep() {
  return (
    <VStack align="start" w="full">
      <Heading size="sm">Review</Heading>

      <LbpFormAction />
    </VStack>
  )
}
