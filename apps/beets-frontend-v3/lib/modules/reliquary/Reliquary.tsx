'use client'

import { VStack } from '@chakra-ui/react'
import { useGetRelicPositionsOfOwner } from './hooks/useGetRelicPositionsOfOwner'
import { Relic } from './components/Relic'
import { useReliquary } from './ReliquaryProvider'

export function Reliquary() {
  const { chain } = useReliquary()
  const { relics } = useGetRelicPositionsOfOwner(chain)

  return (
    <VStack align="start" h="full" w="full">
      {relics?.map(relic => <Relic chain={chain} key={relic.relicId} relic={relic} />)}
    </VStack>
  )
}
