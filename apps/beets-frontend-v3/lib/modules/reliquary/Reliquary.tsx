'use client'

import { Box, VStack, CardBody, Card } from '@chakra-ui/react'
import { useGetRelicPositionsOfOwner } from './hooks/useGetRelicPositionsOfOwner'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useGetPositionForId } from './hooks/useGetPositionForId'
import { useGetLevelOnUpdate } from './hooks/useGetLevelOnUpdate'
import { useGetLevelInfo } from './hooks/useGetLevelInfo'
import { useGetDepositImpact } from './hooks/useGetDepositImpact'
import { useGetReliquaryFarmSnapshots } from './hooks/useGetReliquaryFarmSnapshots'

const CHAIN = GqlChain.Sonic

export function Reliquary() {
  // onchain
  const { positions } = useGetRelicPositionsOfOwner(CHAIN)
  const { position } = useGetPositionForId(CHAIN, '16')
  const { levelOnUpdate } = useGetLevelOnUpdate(CHAIN, '16')
  const { maturityThresholds } = useGetLevelInfo(CHAIN, '0')
  const depositImpact = useGetDepositImpact(CHAIN, '1', '16')

  // api
  const { query } = useGetReliquaryFarmSnapshots()

  console.log({ positions, position, levelOnUpdate, maturityThresholds, depositImpact, query })

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
