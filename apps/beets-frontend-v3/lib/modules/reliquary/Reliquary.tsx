'use client'

import { VStack } from '@chakra-ui/react'
import { useGetRelicPositionsOfOwner } from './hooks/useGetRelicPositionsOfOwner'
import { Relic } from './components/Relic'
import { useReliquary } from './ReliquaryProvider'
import { useEffect, useRef } from 'react'

export function Reliquary() {
  const { chain, setSelectedRelic } = useReliquary()
  const { relics } = useGetRelicPositionsOfOwner(chain)
  const hasSetInitialRelic = useRef(false)

  useEffect(() => {
    if (relics && relics.length > 0 && !hasSetInitialRelic.current) {
      setSelectedRelic(relics[0])
      hasSetInitialRelic.current = true
    }
  }, [relics, setSelectedRelic])

  return (
    <VStack align="start" h="full" w="full">
      {relics?.map(relic => <Relic chain={chain} key={relic.relicId} relic={relic} />)}
    </VStack>
  )
}
