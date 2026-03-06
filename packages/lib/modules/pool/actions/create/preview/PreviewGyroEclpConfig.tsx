import { Card, VStack, Text, SimpleGrid, Box, HStack, Button, Separator } from '@chakra-ui/react'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { RefreshCcw } from 'react-feather'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { NUM_FORMAT } from '../constants'
import ReactECharts from 'echarts-for-react'
import { useEclpChart } from '@repo/lib/modules/eclp/hooks/EclpChartProvider'
import { useWatch } from 'react-hook-form'

export function PreviewGyroEclpConfig() {
  const { eclpConfigForm, poolCreationForm, invertGyroEclpPriceParams, isBeforeStep } =
    usePoolCreationForm()
  const [alpha, beta, peakPrice] = useWatch({
    control: eclpConfigForm.control,
    name: ['alpha', 'beta', 'peakPrice'],
  })
  const poolTokens = useWatch({ control: poolCreationForm.control, name: 'poolTokens' })

  const { options } = useEclpChart()

  const priceDisplayCards = [
    {
      color: 'purple.400',
      label: 'Lower bound',
      value: alpha ? fNumCustom(alpha, NUM_FORMAT) : '-',
    },
    {
      color: 'green.400',
      label: 'Peak price',
      value: peakPrice ? fNumCustom(peakPrice, NUM_FORMAT) : '-',
    },
    {
      color: 'orange.400',
      label: 'Upper bound',
      value: beta ? fNumCustom(beta, NUM_FORMAT) : '-',
    },
  ]
  const tokenSymbols = poolTokens.map(token => token.data?.symbol).filter(Boolean)
  const tokenSymbolsString = tokenSymbols.join(' / ')

  if (isBeforeStep('Details')) return null

  return (
    <Card.Root>
      <VStack gap="md" w="full">
        <SimpleGrid columns={3} gap={3} w="full">
          {priceDisplayCards.map(({ color, label, value }) => (
            <Card.Root key={label} variant="subSection">
              <VStack align="start" gap="sm">
                <HStack gap="sm">
                  <Box bg={color} borderRadius="full" h="8px" w="8px" />

                  <Text color="font.secondary" fontSize="sm">
                    {label}
                  </Text>
                </HStack>

                <Text fontWeight="bold">{value}</Text>
              </VStack>
            </Card.Root>
          ))}
        </SimpleGrid>

        <Separator />

        <Box h={333} w="full">
          <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
        </Box>

        <Separator />

        <HStack justify="space-between" w="full">
          <Button
            flexDirection="row"
            gap="2"
            onClick={invertGyroEclpPriceParams}
            size="sm"
            variant="tertiary"
          >
            <HStack>
              <RefreshCcw size={12} />

              <Text color="font.secondary" fontSize="sm">
                {tokenSymbolsString}
              </Text>
            </HStack>
          </Button>
        </HStack>
      </VStack>
    </Card.Root>
  )
}
