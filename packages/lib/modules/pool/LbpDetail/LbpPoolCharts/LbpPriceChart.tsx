import { isAfter, isBefore } from 'date-fns'
import { Divider, HStack, Text, VStack, Box, Heading, Stack } from '@chakra-ui/react'
import { ProjectedPriceChart } from '@repo/lib/modules/lbp/steps/sale-structure/ProjectedPriceChart'
import { max } from '@repo/lib/modules/lbp/pool/usePriceInfo'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { useLbpPoolCharts } from './LbpPoolChartsProvider'

export function LbpPriceChart() {
  const { snapshots, isLoading, startDateTime, endDateTime, now, salePeriodText } =
    useLbpPoolCharts()

  return (
    <VStack h="full">
      <ProjectedPriceChart
        cutTime={now}
        endDateTime={endDateTime}
        gridLeft="7.5%"
        isLoading={isLoading}
        prices={snapshots}
        startDateTime={startDateTime}
      />
      <Divider />
      <Stack
        align="start"
        direction={{ base: 'column', md: 'row' }}
        mt="2"
        spacing={{ base: 2, md: 4 }}
        w="full"
      >
        <HStack>
          <Box bgGradient="linear(to-r, #B3AEF5, #EAA879)" height="2px" width="15px" />
          <Text fontSize="sm">Spot price</Text>
        </HStack>
        <HStack>
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
        </HStack>
        <Text color="font.secondary" fontSize="sm" ml={{ base: 0, md: 'auto' }}>
          {salePeriodText}
        </Text>
      </Stack>
    </VStack>
  )
}

export function PriceInfo() {
  const { now: currentTime, currentPrice, hasSnapshots, snapshots } = useLbpPoolCharts()

  return (
    <VStack alignItems="end" spacing="0.5">
      <Heading fontWeight="bold" size="h5">
        {`$${fNum('fiat', currentPrice, { forceThreeDecimals: true })}`}
      </Heading>
      {hasSnapshots && isBefore(currentTime, snapshots[0].timestamp) ? (
        <Text color="font.secondary" fontSize="12px">
          Start price
        </Text>
      ) : hasSnapshots && isAfter(currentTime, snapshots[snapshots.length - 1].timestamp) ? (
        <Text color="font.secondary" fontSize="12px">
          End price
        </Text>
      ) : hasSnapshots ? (
        <Text color="font.error" fontSize="12px">
          {`${percentageChange(max(snapshots), currentPrice)}%`}
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
