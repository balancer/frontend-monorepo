'use client'

import { Box, VStack, CardBody, Card } from '@chakra-ui/react'
import { useGetRelicPositionsOfOwner } from './hooks/useGetRelicPositionsOfOwner'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useGetPositionForId } from './hooks/useGetPositionForId'
import { useGetLevelOnUpdate } from './hooks/useGetLevelOnUpdate'
import { useGetLevelInfo } from './hooks/useGetLevelInfo'
import { useGetDepositImpact } from './hooks/useGetDepositImpact'

const CHAIN = GqlChain.Sonic

export function Reliquary() {
  const { positions } = useGetRelicPositionsOfOwner(CHAIN)
  const { position } = useGetPositionForId(CHAIN, '16')
  const { levelOnUpdate } = useGetLevelOnUpdate(CHAIN, '16')
  const { maturityThresholds } = useGetLevelInfo(CHAIN, '0')
  const depositImpact = useGetDepositImpact(CHAIN, '1', '16')

  console.log({ positions, position, levelOnUpdate, maturityThresholds, depositImpact })

  return (
    <Card rounded="xl" w="full">
      <VStack h="full" w="full">
        <CardBody align="start" as={VStack} h="full" w="full">
          <Box h="full" w="full">
            TEST
          </Box>
        </CardBody>
      </VStack>
    </Card>
  )
}
