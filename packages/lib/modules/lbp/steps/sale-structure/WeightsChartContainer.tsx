import { Divider, HStack, Stack, Text } from '@chakra-ui/react'
import { WeightsChart } from '@repo/lib/modules/lbp/steps/sale-structure/WeightsChart'
import { parseISO } from 'date-fns'

type WeightsChartContainerProps = {
  collateralTokenSymbol: string
  endWeight: number
  launchTokenSymbol: string
  startWeight: number
  startDate: string
  endDate: string
  salePeriodText: string
  cutTime?: Date
}

export function WeightsChartContainer({
  collateralTokenSymbol,
  endWeight,
  launchTokenSymbol,
  startWeight,
  startDate,
  endDate,
  salePeriodText,
  cutTime,
}: WeightsChartContainerProps) {
  return (
    <>
      <WeightsChart
        collateralTokenSymbol={collateralTokenSymbol}
        cutTime={cutTime}
        endDate={parseISO(endDate)}
        endWeight={endWeight}
        launchTokenSymbol={launchTokenSymbol}
        startDate={parseISO(startDate)}
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
