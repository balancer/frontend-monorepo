'use client'

import { Card, Flex, Text, VStack } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { ReliquaryCurveChart } from './ReliquaryCurveChart'
import { ReliquaryDetailsCharts } from './ReliquaryDetailsCharts'

export function MaBeetsCharts() {
  return (
    <Flex flexWrap="wrap" gap="8" width="full">
      <VStack align="flex-start" flex="1" minWidth="300px" spacing="4">
        <Text
          background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
          backgroundClip="text"
          fontSize="xl"
          fontWeight="bold"
        >
          maBEETs Metrics
        </Text>
        <Card h="400" w="full">
          <NoisyCard cardProps={{ h: 'full' }}>
            <ReliquaryDetailsCharts />
          </NoisyCard>
        </Card>
      </VStack>
      <VStack align="flex-start" flex="1" minWidth="300px" spacing="4">
        <Text
          background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
          backgroundClip="text"
          fontSize="xl"
          fontWeight="bold"
        >
          maBEETs Maturity Curve
        </Text>
        <Card h="400" w="full">
          <NoisyCard cardProps={{ h: 'full' }}>
            <ReliquaryCurveChart />
          </NoisyCard>
        </Card>
      </VStack>
    </Flex>
  )
}
