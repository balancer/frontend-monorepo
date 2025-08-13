import { VStack, Heading, Flex, Card, CardHeader, HStack, Text, CardBody } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { usePoolForm } from './PoolFormProvider'
import { capitalize } from 'lodash'

export function PoolPreview() {
  const {
    poolConfigForm: { watch },
  } = usePoolForm()
  const { network, protocol, poolType } = watch()

  return (
    <>
      <NoisyCard
        cardProps={{
          w: 'full',
          overflow: 'hidden',
          rounded: 'xl',
        }}
      >
        <VStack align="start" p="lg" spacing="lg" w="full">
          <Flex alignItems="center" w="full">
            <Heading color="font.maxContrast" size="md">
              Pool preview
            </Heading>
          </Flex>

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
                  <Text fontWeight="semibold">{capitalize(poolType)}</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </NoisyCard>
    </>
  )
}
