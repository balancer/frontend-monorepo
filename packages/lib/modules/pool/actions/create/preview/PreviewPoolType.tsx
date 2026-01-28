import { VStack, Heading, HStack, Text, CardBody, Box } from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { getChainName } from '@repo/lib/config/app.config'
import { NetworkPreviewSVG } from '@repo/lib/shared/components/imgs/ReClammConfigSvgs'
import { PreviewPoolCreationCard } from './PreviewPoolCreationCard'
import { POOL_TYPES } from '../constants'
import { isWeightedPool, isCustomWeightedPool, isCowPool } from '../helpers'
import { useWatch } from 'react-hook-form'

export function PreviewPoolType() {
  const { poolCreationForm } = usePoolCreationForm()
  const [network, protocol, poolType, weightedPoolStructure, poolTokens] = useWatch({
    control: poolCreationForm.control,
    name: ['network', 'protocol', 'poolType', 'weightedPoolStructure', 'poolTokens'],
  })

  const selectedPoolTokens = poolTokens.filter(token => token.address)
  const tokenAddresses = selectedPoolTokens.map(token => token.address!)
  const tokenSymbols = selectedPoolTokens.map(token => token.data?.symbol || '')
  const tokenWeights = isWeightedPool(poolType)
    ? selectedPoolTokens.map(token => Number(token.weight))
    : undefined
  const showWeightStructure = isWeightedPool(poolType) || isCowPool(poolType)

  const cardInformationRows = [
    {
      label: 'Protocol',
      value: protocol,
    },
    {
      label: 'Network',
      value: getChainName(network),
    },
    {
      label: 'Pool type',
      value:
        POOL_TYPES[poolType].label +
        (showWeightStructure
          ? `: ${isCustomWeightedPool(poolType, weightedPoolStructure) ? 'Custom' : `${!isCowPool(poolType) ? '2-token ' : ''}${weightedPoolStructure}`}`
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
            <NetworkPreviewSVG
              chain={network}
              tokenAddresses={tokenAddresses}
              tokenSymbols={tokenSymbols}
              tokenWeights={tokenWeights}
            />
            <Box left="50%" position="absolute" top="50%" transform="translate(-50%, -50%)">
              <NetworkIcon bg="background.level4" chain={network} shadow="lg" />
            </Box>
          </Box>
        </HStack>
      </CardBody>
    </PreviewPoolCreationCard>
  )
}
