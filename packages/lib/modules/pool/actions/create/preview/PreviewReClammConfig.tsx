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

export function PreviewReClammConfig({
  isBeforeStep,
  lowerMarginValue,
  upperMarginValue,
}: {
  isBeforeStep: boolean
  lowerMarginValue: number | undefined
  upperMarginValue: number | undefined
}) {
  const { options } = useReclAmmChart()
  const { reClammConfigForm, poolCreationForm, invertReClammPriceParams } = usePoolCreationForm()
  const { initialTargetPrice, initialMinPrice, initialMaxPrice, priceShiftDailyRate } =
    reClammConfigForm.watch()
  const { poolTokens } = poolCreationForm.watch()

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
  const showInvertButton = tokenSymbols.length > 0

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

          <Divider />

          <Box h={333} w="full">
            <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
          </Box>

          {showInvertButton && (
            <>
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
                  <Box bg="background.level3" borderRadius="md" p={2.5}>
                    <Text color="font.secondary" fontSize="xs">
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
