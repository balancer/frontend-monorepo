import { Card, Flex, Text, VStack } from '@chakra-ui/react';
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { ReliquaryCurveChart } from './ReliquaryCurveChart'
import { ReliquaryDetailsCharts } from './ReliquaryDetailsCharts'

export function MaBeetsCharts() {
  return (
    <Flex flexWrap="wrap" gap="8" width="full">
      <VStack align="flex-start" flex="1" minWidth="300px" gap="4">
        <Text
          background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
          backgroundClip="text"
          fontSize="xl"
          fontWeight="bold"
        >
          maBEETS Metrics
        </Text>
        <Card.Root h="400" w="full">
          <NoisyCard cardProps={{ h: 'full' }}>
            <ReliquaryDetailsCharts />
          </NoisyCard>
        </Card.Root>
      </VStack>
      <VStack align="flex-start" flex="1" minWidth="300px" gap="4">
        <Text
          background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
          backgroundClip="text"
          fontSize="xl"
          fontWeight="bold"
        >
          maBEETS Maturity Curve
        </Text>
        <Card.Root h="400" w="full">
          <NoisyCard cardProps={{ h: 'full' }}>
            <ReliquaryCurveChart />
          </NoisyCard>
        </Card.Root>
      </VStack>
    </Flex>
  );
}
