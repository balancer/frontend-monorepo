import { Card, CardBody, CardHeader, Heading, HStack, Spacer, Text } from '@chakra-ui/react'
import { WeightsChartContainer } from '../sale-structure/WeightsChartContainer'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { differenceInDays, parseISO, differenceInHours } from 'date-fns'

type Props = {
  startDateTime: string
  endDateTime: string
  startWeight: number
  endWeight: number
  launchTokenMetadata: ReturnType<typeof useTokenMetadata>
  collateralToken: ApiToken | undefined
}

export function PoolWeights({
  startDateTime,
  endDateTime,
  startWeight,
  endWeight,
  launchTokenMetadata,
  collateralToken,
}: Props) {
  const daysDiff = differenceInDays(parseISO(endDateTime), parseISO(startDateTime))
  const hoursDiff =
    differenceInHours(parseISO(endDateTime), parseISO(startDateTime)) - daysDiff * 24
  const salePeriodText =
    startDateTime && endDateTime
      ? `Sale period: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''}`
      : ''

  return (
    <Card h="450px">
      <CardHeader>
        <HStack>
          <Heading size="sm">LBP pool weight shifts</Heading>
          <Spacer />
          <Text color="font.secondary" fontWeight="bold">
            Standard linear
          </Text>
        </HStack>
      </CardHeader>
      <CardBody>
        <WeightsChartContainer
          collateralTokenSymbol={collateralToken?.symbol || ''}
          endDateTime={endDateTime}
          endWeight={endWeight}
          launchTokenSymbol={launchTokenMetadata.symbol || ''}
          salePeriodText={salePeriodText}
          startDateTime={startDateTime}
          startWeight={startWeight}
        />
      </CardBody>
    </Card>
  )
}
