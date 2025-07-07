import { isAfter, isBefore } from 'date-fns'
import { Divider, HStack, Text, VStack, Box, Heading } from '@chakra-ui/react'
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
        gridLeft="7.5%"
        isLoading={isLoading}
        prices={prices}
        startDate={startTime}
      />
      <Divider />
      <HStack mt="2" w="full">
        <Box bgGradient="linear(to-r, #B3AEF5, #EAA879)" height="2px" width="15px" />
        <Text fontSize="sm">Spot price</Text>
        <Box height="2px" overflow="hidden" position="relative" width="15px">
          <Box
            bgGradient="linear(to-r, #B3AEF5, #EAA879)"
            inset="0"
            position="absolute"
            style={{
              maskImage:
                'repeating-linear-gradient(to right, black 0, black 3px, transparent 3px, transparent 6px)',
              WebkitMaskImage:
                'repeating-linear-gradient(to right, black 0, black 3px, transparent 3px, transparent 6px)',
            }}
          />
        </Box>
        <Text fontSize="sm">Projected price with no buys</Text>
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
      <Heading fontWeight="bold" size="h5">
        {`$${fNum('fiat', currentPrice, { forceThreeDecimals: true })}`}
      </Heading>
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
