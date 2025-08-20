import { VStack, Heading, Card, CardHeader, HStack, Text, CardBody } from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { capitalize } from 'lodash'
import { WeightedPoolStructure } from '../constants'

export function PoolTypeCard() {
  const { network, protocol, poolType, weightedPoolStructure, isWeightedPool } =
    usePoolCreationForm()

  const isCustomWeightedPool = weightedPoolStructure === WeightedPoolStructure.Custom

  const POOL_TYPE_INFO = [
    {
      label: 'Protocol',
      value: capitalize(protocol),
    },
    {
      label: 'Network',
      value: capitalize(network),
    },
    {
      label: 'Pool type',
      value:
        capitalize(poolType) +
        (isWeightedPool && `: ${!isCustomWeightedPool ? '2-token' : ''} ${weightedPoolStructure}`),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between" w="full">
          <Heading size="md">Pool Type</Heading>
          <NetworkIcon bg="background.level4" chain={network} shadow="lg" size={8} />
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing="sm">
          {POOL_TYPE_INFO.map(({ label, value }) => (
            <HStack align="start" key={label} spacing="lg" w="full">
              <Text color="font.secondary" w="20">
                {label}
              </Text>
              <Text fontWeight="semibold">{value}</Text>
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  )
}
