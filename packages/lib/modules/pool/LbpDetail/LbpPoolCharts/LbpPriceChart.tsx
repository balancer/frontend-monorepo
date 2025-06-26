import { isAfter, isBefore } from 'date-fns'
import { Divider, HStack, Text, VStack } from '@chakra-ui/react'
import { ProjectedPriceChart } from '@repo/lib/modules/lbp/steps/sale-structure/ProjectedPriceChart'
import { max } from '@repo/lib/modules/lbp/pool/usePriceInfo'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { useLbpPoolCharts } from './LbpPoolChartsProvider'

export function LbpPriceChart() {
  const { prices, isLoading, startTime, endTime, now, salePeriodText } = useLbpPoolCharts()

  return (
    <VStack>
      <ProjectedPriceChart
        cutTime={now}
        endDate={endTime}
        isLoading={isLoading}
        prices={prices}
        startDate={startTime}
      />
      <Divider />
      <HStack mt="2" w="full">
        <hr
          style={{
            width: '15px',
            border: '1px solid',
            borderColor: 'linear-gradient(90deg, #194D05 0%, #30940A 100%)',
          }}
        />
        <Text>{`Spot price`}</Text>
        <hr
          style={{
            width: '15px',
            border: '1px dashed',
            borderColor: 'linear-gradient(90deg, #194D05 0%, #30940A 100%)',
          }}
        />
        <Text>{`Projected price with no buys`}</Text>
        <Text color="font.secondary" fontSize="sm" ml="auto">
          {salePeriodText}
        </Text>
      </HStack>
    </VStack>
  )
}

export function PriceInfo() {
  const { now: currentTime, currentPrice, hasPrices, prices } = useLbpPoolCharts()

  return (
    <VStack alignItems="end" spacing="0.5">
      <Text fontSize="24px" fontWeight="bold">
        {`$${fNum('fiat', currentPrice, { forceThreeDecimals: true })}`}
      </Text>
      {hasPrices && isBefore(currentTime, prices[0].timestamp) ? (
        <Text color="font.secondary" fontSize="12px">
          Start price
        </Text>
      ) : hasPrices && isAfter(currentTime, prices[prices.length - 1].timestamp) ? (
        <Text color="font.secondary" fontSize="12px">
          End price
        </Text>
      ) : hasPrices ? (
        <Text color="font.error" fontSize="12px">
          {`${percentageChange(max(prices), currentPrice)}%`}
        </Text>
      ) : (
        <Text color="font.secondary" fontSize="12px">
          &mdash;
        </Text>
      )}
    </VStack>
  )
}

function percentageChange(oldValue: number, newValue: number) {
  if (oldValue === 0) {
    return newValue === 0 ? '0.00' : 'N/A'
  }

  return (((newValue - oldValue) / oldValue) * 100).toFixed(2)
}
