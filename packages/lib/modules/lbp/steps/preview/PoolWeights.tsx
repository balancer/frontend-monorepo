import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  HStack,
  Spacer,
  Text,
} from '@chakra-ui/react'
import { WeightsChart } from '../sale-structure/WeightsChart'
import { differenceInDays, differenceInHours, parseISO } from 'date-fns'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'

type Props = {
  startTime: string
  endTime: string
  startWeight: number
  endWeight: number
  launchTokenMetadata: ReturnType<typeof useTokenMetadata>
  collateralToken: ApiToken | undefined
}

export function PoolWeights({
  startTime,
  endTime,
  startWeight,
  endWeight,
  launchTokenMetadata,
  collateralToken,
}: Props) {
  const daysDiff = differenceInDays(parseISO(endTime), parseISO(startTime))
  const hoursDiff = differenceInHours(parseISO(endTime), parseISO(startTime)) - daysDiff * 24
  const salePeriodText =
    startTime && endTime
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
        <WeightsChart
          startWeight={startWeight}
          endWeight={endWeight}
          startDate={parseISO(startTime)}
          endDate={parseISO(endTime)}
        />

        <Divider />

        <HStack mt="2">
          <Text color="font.special" fontWeight="extrabold">
            &mdash;
          </Text>
          <Text>{launchTokenMetadata.symbol}</Text>
          <Text color="#93C6FF" fontWeight="extrabold">
            &mdash;
          </Text>
          <Text>{collateralToken?.symbol}</Text>
          <Spacer />
          <Text color="font.secondary" fontSize="sm">
            {salePeriodText}
          </Text>
        </HStack>
      </CardBody>
    </Card>
  )
}
