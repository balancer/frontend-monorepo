'use client'

import { Box, VStack, CardBody, Card } from '@chakra-ui/react'
import { useGetRelicPositionsOfOwner } from './hooks/useGetRelicPositionsOfOwner'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useGetPositionForId } from './hooks/useGetPositionForId'
import { useGetLevelOnUpdate } from './hooks/useGetLevelOnUpdate'
import { useGetLevelInfo } from './hooks/useGetLevelInfo'

const CHAIN = GqlChain.Sonic

export function Reliquary() {
  const { positions } = useGetRelicPositionsOfOwner(CHAIN)
  const { data } = useGetPositionForId(CHAIN, '67')
  const { levelOnUpdate } = useGetLevelOnUpdate(CHAIN, '67')
  const { maturityThresholds } = useGetLevelInfo(CHAIN, '0')

  console.log({ positions, data, levelOnUpdate, maturityThresholds })

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
