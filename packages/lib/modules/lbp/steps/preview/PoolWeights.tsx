import { Card, CardBody, CardHeader, Heading, HStack, Spacer, Text } from '@chakra-ui/react'
import { WeightsChartContainer } from '../sale-structure/WeightsChartContainer'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { differenceInDays, parseISO, differenceInHours } from 'date-fns'

type Props = {
  startDate: string
  endDate: string
  startWeight: number
  endWeight: number
  launchTokenMetadata: ReturnType<typeof useTokenMetadata>
  collateralToken: ApiToken | undefined
}

export function PoolWeights({
  startDate,
  endDate,
  startWeight,
  endWeight,
  launchTokenMetadata,
  collateralToken,
}: Props) {
  const daysDiff = differenceInDays(parseISO(endDate), parseISO(startDate))
  const hoursDiff = differenceInHours(parseISO(endDate), parseISO(startDate)) - daysDiff * 24
  const salePeriodText =
    startDate && endDate
      ? `Sale period: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''}`
      : ''

  return (
    <Card h="450px">
      <CardHeader>
        <HStack>
          <Heading size="sm">LBP pool weight shifts</Heading>
          <Spacer />
          <Text color="font.secondary" fontWeight="bold" letterSpacing="-0.04rem">
            Standard linear
          </Text>
        </HStack>
      </CardHeader>
      <CardBody>
        <WeightsChartContainer
          collateralTokenSymbol={collateralToken?.symbol || ''}
          endDate={endDate}
          endWeight={endWeight}
          launchTokenSymbol={launchTokenMetadata.symbol || ''}
          salePeriodText={salePeriodText}
          startDate={startDate}
          startWeight={startWeight}
        />
      </CardBody>
    </Card>
  )
}
