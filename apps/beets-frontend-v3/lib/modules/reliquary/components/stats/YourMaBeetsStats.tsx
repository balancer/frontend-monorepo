'use client'

import { SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { useReliquary } from '../../ReliquaryProvider'
import RelicStat, { StatLabel, StatValueText } from './RelicStat'

export function YourMaBeetsStats() {
  const { relicPositions, totalMaBeetsVP } = useReliquary()

  return (
    <VStack align="flex-start" flex="1" spacing="4" width="full">
      <Text
        background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
        backgroundClip="text"
        fontSize="xl"
        fontWeight="bold"
      >
        Your maBEETs Summary
      </Text>
      <SimpleGrid columns={2} spacing={{ base: 'sm', md: 'md' }} w="full">
        <RelicStat>
          <StatLabel label="Your Relics" />
          <StatValueText>{relicPositions.length}</StatValueText>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Total Liquidity" />
          <StatValueText>$0.00</StatValueText>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Avg Maturity Lvl" />
          <StatValueText>0</StatValueText>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Total Pending Rewards" />
          <StatValueText>$0.00</StatValueText>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Total Relic Share" />
          <StatValueText>0%</StatValueText>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Total Voting Power" />
          <StatValueText>{fNumCustom(totalMaBeetsVP, '0.000a')} maBEETS</StatValueText>
        </RelicStat>
      </SimpleGrid>
    </VStack>
  )
}
