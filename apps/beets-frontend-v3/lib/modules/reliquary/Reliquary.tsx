'use client'

import { VStack } from '@chakra-ui/react'
import { useGetRelicPositionsOfOwner } from './hooks/useGetRelicPositionsOfOwner'
import { Relic } from './components/Relic'
import { useReliquary } from './ReliquaryProvider'
import { useEffect, useRef } from 'react'
import { useReliquaryZap } from './hooks/useReliquaryZap'

export function Reliquary() {
  const { chain, setSelectedRelic } = useReliquary()
  const { relics } = useGetRelicPositionsOfOwner(chain)
  const hasSetInitialRelic = useRef(false)

  const { getReliquaryDepositCallData } = useReliquaryZap(chain)

  const handleDeposit = async () => {
    const callData = await getReliquaryDepositCallData({
      userAddress: '0x6B808e314d7f758076922297bcD2eCd56aFe7B19', // user's address
      beetsAmount: '0.09', // amount of BEETS tokens
      stsAmount: '0.01', // amount of FTM
      slippage: '0.005', // 1% slippage
      //relicId: 123, // optional relic ID
    })

    console.log({ callData })
    // Use the callData for your transaction
  }

  handleDeposit()

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
