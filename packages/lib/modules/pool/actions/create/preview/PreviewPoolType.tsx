import { VStack, Heading, HStack, Text, CardBody, Box } from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { capitalize } from 'lodash'
import { validatePoolType } from '../validatePoolCreationForm'
import { NetworkPreviewSVG } from '@repo/lib/shared/components/imgs/ReClammConfigSvgs'
import { PreviewPoolCreationCard } from './PreviewPoolCreationCard'
import { POOL_TYPES } from '../constants'

export function PreviewPoolType() {
  const { poolCreationForm } = usePoolCreationForm()
  const [network, protocol, poolType, weightedPoolStructure] = poolCreationForm.watch([
    'network',
    'protocol',
    'poolType',
    'weightedPoolStructure',
  ])
  const isWeightedPool = validatePoolType.isWeightedPool(poolType)
  const isCustomWeightedPool = validatePoolType.isCustomWeightedPool(
    poolType,
    weightedPoolStructure
  )

  const cardInformationRows = [
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
        POOL_TYPES[poolType].label +
        (isWeightedPool
          ? `: ${!isCustomWeightedPool ? '2-token' : ''} ${weightedPoolStructure}`
          : ''),
    },
  ]

  return (
    <PreviewPoolCreationCard stepTitle="Type">
      <CardBody p="sm">
        <HStack alignItems="start" justify="space-between" w="full">
          <VStack align="start" h="full" spacing="md">
            <Heading marginBottom="sm" size="md">
              Pool Type
            </Heading>
            {cardInformationRows.map(({ label, value }) => (
              <HStack align="start" key={label} spacing="lg" w="full">
                <Text color="font.secondary" w="20">
                  {label}
                </Text>
                <Text fontWeight="semibold">{value}</Text>
              </HStack>
            ))}
          </VStack>

          <Box position="relative">
            <NetworkPreviewSVG />
            <Box left="50%" position="absolute" top="50%" transform="translate(-50%, -50%)">
              <NetworkIcon bg="background.level4" chain={network} shadow="lg" />
            </Box>
          </Box>
        </HStack>
      </CardBody>
    </PreviewPoolCreationCard>
  )
}
