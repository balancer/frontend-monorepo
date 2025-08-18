import { VStack, Heading, Card, CardHeader, HStack, Text, CardBody } from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { capitalize } from 'lodash'
import { PoolType } from '@balancer/sdk'
import { WeightedPoolStructure } from '../constants'

export function PoolTypeCard() {
  const {
    poolConfigForm: { watch },
  } = usePoolCreationForm()
  const { network, protocol, poolType, weightedPoolStructure } = watch()

  const isWeightedPool = poolType === PoolType.Weighted
  const isCustomWeightedPool = weightedPoolStructure === WeightedPoolStructure.Custom

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between" w="full">
          <Heading size="sm">Pool Type</Heading>
          <NetworkIcon bg="background.level4" chain={network} shadow="lg" size={8} />
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing="sm">
          <HStack align="start" spacing="lg" w="full">
            <Text color="font.secondary">Protocol</Text>
            <Text fontWeight="semibold">{capitalize(protocol)}</Text>
          </HStack>
          <HStack align="start" spacing="lg" w="full">
            <Text color="font.secondary">Network</Text>
            <Text fontWeight="semibold">{capitalize(network)}</Text>
          </HStack>
          <HStack align="start" spacing="md" w="full">
            <Text color="font.secondary">Pool type</Text>
            <Text fontWeight="semibold">
              {capitalize(poolType)}
              {isWeightedPool &&
                `: ${!isCustomWeightedPool ? '2-token' : ''} ${weightedPoolStructure}`}
            </Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}
