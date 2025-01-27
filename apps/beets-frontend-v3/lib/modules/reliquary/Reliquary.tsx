'use client'

import { VStack } from '@chakra-ui/react'
import { useGetRelicPositionsOfOwner } from './hooks/useGetRelicPositionsOfOwner'
import { Relic } from './components/Relic'
import { useReliquary } from './ReliquaryProvider'
import { useEffect } from 'react'

export function Reliquary() {
  const { chain, setSelectedRelic } = useReliquary()
  const { relics } = useGetRelicPositionsOfOwner(chain)

  useEffect(() => {
    setSelectedRelic(relics[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <VStack align="start" h="full" w="full">
      {relics?.map(relic => <Relic chain={chain} key={relic.relicId} relic={relic} />)}
    </VStack>
  )
}
