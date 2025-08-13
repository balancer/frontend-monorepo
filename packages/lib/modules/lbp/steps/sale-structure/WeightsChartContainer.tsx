import { Divider, HStack, Stack, Text } from '@chakra-ui/react'
import { WeightsChart } from '@repo/lib/modules/lbp/steps/sale-structure/WeightsChart'
import { parseISO } from 'date-fns'

type WeightsChartContainerProps = {
  collateralTokenSymbol: string
  endWeight: number
  launchTokenSymbol: string
  startWeight: number
  startDateTime: string
  endDateTime: string
  salePeriodText: string
  cutTime?: Date
}

export function WeightsChartContainer({
  collateralTokenSymbol,
  endWeight,
  launchTokenSymbol,
  startWeight,
  startDateTime,
  endDateTime,
  salePeriodText,
  cutTime,
}: WeightsChartContainerProps) {
  return (
    <>
      <WeightsChart
        collateralTokenSymbol={collateralTokenSymbol}
        cutTime={cutTime}
        endDateTime={parseISO(endDateTime)}
        endWeight={endWeight}
        launchTokenSymbol={launchTokenSymbol}
        startDateTime={parseISO(startDateTime)}
        startWeight={startWeight}
      />
      <Divider />
      <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" mt="2" w="full">
        <HStack>
          <Text color="font.special" fontWeight="extrabold">
            &mdash;
          </Text>
          <Text>{launchTokenSymbol}</Text>
          <Text color="#93C6FF" fontWeight="extrabold">
            &mdash;
          </Text>
          <Text>{collateralTokenSymbol}</Text>
        </HStack>
        <Text color="font.secondary" fontSize="sm">
          {salePeriodText}
        </Text>
      </Stack>
    </>
  )
}
