import {
  Card,
  CardBody,
  SimpleGrid,
  VStack,
  Divider,
  Text,
  HStack,
  Button,
  Box,
} from '@chakra-ui/react'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { RefreshCcw } from 'react-feather'
import { formatNumber } from '../helpers'
import ReactECharts from 'echarts-for-react'
import { useReclAmmChart } from '@repo/lib/modules/reclamm/ReclAmmChartProvider'

type Props = {
  isBeforeStep: boolean
  lowerMarginValue: number | undefined
  upperMarginValue: number | undefined
}

export function PreviewReClammConfig({ isBeforeStep, lowerMarginValue, upperMarginValue }: Props) {
  const { options } = useReclAmmChart()
  const { reClammConfigForm, poolCreationForm, invertReClammPriceParams } = usePoolCreationForm()
  const [initialTargetPrice, initialMinPrice, initialMaxPrice, priceShiftDailyRate] =
    reClammConfigForm.watch([
      'initialTargetPrice',
      'initialMinPrice',
      'initialMaxPrice',
      'priceShiftDailyRate',
    ])
  const poolTokens = poolCreationForm.watch('poolTokens')

  const reClammConfigCards = [
    {
      label: 'Min Price',
      value: initialMinPrice ? formatNumber(initialMinPrice) : '-',
    },
    {
      label: 'Lower Target',
      value: upperMarginValue ? formatNumber(upperMarginValue.toString()) : '-',
    },
    {
      label: 'Current Price',
      value: initialTargetPrice ? formatNumber(initialTargetPrice) : '-',
    },
    {
      label: 'Upper Target',
      value: lowerMarginValue ? formatNumber(lowerMarginValue.toString()) : '-',
    },
    {
      label: 'Max Price',
      value: initialMaxPrice ? formatNumber(initialMaxPrice) : '-',
    },
  ]

  const tokenSymbols = poolTokens.map(token => token.data?.symbol).filter(Boolean)
  const tokenSymbolsString = tokenSymbols.join(' / ')

  return (
    <Card opacity={isBeforeStep ? 0.5 : 1}>
      <CardBody>
        <VStack spacing="lg">
          <SimpleGrid columns={5} spacing={3} w="full">
            {reClammConfigCards.map(({ label, value }) => (
              <Card key={label} variant="subSection">
                <Text color="font.secondary" fontSize="sm">
                  {label}
                </Text>
                <Text fontSize="sm" fontWeight="bold">
                  {value}
                </Text>
              </Card>
            ))}
          </SimpleGrid>

          {!isBeforeStep && (
            <>
              <Divider />
              <Box h={333} w="full">
                <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
              </Box>

              <Divider />
              <HStack justify="space-between" w="full">
                <Button
                  flexDirection="row"
                  gap="2"
                  onClick={invertReClammPriceParams}
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

                {priceShiftDailyRate && (
                  <Box
                    bg="linear-gradient(89.81deg, rgba(179, 174, 245, 0.1) -1.06%, rgba(215, 203, 231, 0.1) 27.62%, rgba(229, 200, 200, 0.1) 49.42%, rgba(234, 168, 121, 0.1) 98.68%);"
                    borderRadius="md"
                    p={2.5}
                  >
                    <Text
                      fontSize="xs"
                      sx={{
                        background:
                          'linear-gradient(89.81deg, #B3AEF5 -1.06%, #D7CBE7 27.62%, #E5C8C8 49.42%, #EAA879 98.68%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: 'transparent',
                      }}
                    >
                      Concentration density: {priceShiftDailyRate}%
                    </Text>
                  </Box>
                )}
              </HStack>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
