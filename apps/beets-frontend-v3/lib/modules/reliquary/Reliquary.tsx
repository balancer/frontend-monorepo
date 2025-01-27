'use client'

import { VStack } from '@chakra-ui/react'
import { useGetRelicPositionsOfOwner } from './hooks/useGetRelicPositionsOfOwner'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Relic } from './components/Relic'

const CHAIN = GqlChain.Sonic

export function Reliquary() {
  // onchain
  const { relics } = useGetRelicPositionsOfOwner(CHAIN)

  return (
    <VStack align="start" h="full" w="full">
      {relics?.map(relic => <Relic chain={CHAIN} key={relic.relicId} relic={relic} />)}
    </VStack>
  )
}
