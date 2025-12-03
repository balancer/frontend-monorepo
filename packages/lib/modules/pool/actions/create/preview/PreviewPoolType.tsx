import { VStack, Heading, HStack, Text, CardBody, Box } from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { capitalize } from 'lodash'
import { NetworkPreviewSVG } from '@repo/lib/shared/components/imgs/ReClammConfigSvgs'
import { PreviewPoolCreationCard } from './PreviewPoolCreationCard'
import { POOL_TYPES } from '../constants'
import { isWeightedPool, isCustomWeightedPool } from '../helpers'
import { useWatch } from 'react-hook-form'
import { isBalancer } from '@repo/lib/config/getProjectConfig'

export function PreviewPoolType() {
  const { poolCreationForm } = usePoolCreationForm()
  const [network, protocol, poolType, weightedPoolStructure] = useWatch({
    control: poolCreationForm.control,
    name: ['network', 'protocol', 'poolType', 'weightedPoolStructure'],
  })

  const cardInformationRows = [
    {
      label: 'Protocol',
      value: isBalancer ? 'Balancer v3' : capitalize(protocol),
    },
    {
      label: 'Network',
      value: capitalize(network),
    },
    {
      label: 'Pool type',
      value:
        POOL_TYPES[poolType].label +
        (isWeightedPool(poolType)
          ? `: ${isCustomWeightedPool(poolType, weightedPoolStructure) ? '' : '2-token '}${weightedPoolStructure}`
          : ''),
    },
  ]

  return (
    <PreviewPoolCreationCard stepTitle="Type">
      <CardBody p="sm">
        <HStack alignItems="start" justify="space-between" w="full">
          <VStack align="start" h="full" spacing="md">
            <Heading marginBottom="sm" size="md">
              Pool type
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
