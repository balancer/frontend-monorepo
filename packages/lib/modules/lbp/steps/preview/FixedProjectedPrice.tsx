import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  HStack,
  Spacer,
  Text,
  Box,
} from '@chakra-ui/react'
import {
  addHours,
  differenceInDays,
  differenceInHours,
  isBefore,
  isEqual,
  parseISO,
} from 'date-fns'
import { useEffect, useMemo } from 'react'
import { FixedProjectedPriceChart } from '../sale-structure/FixedProjectedPriceChart'
import { LbpPrice } from '../../pool/usePriceInfo'

type Props = {
  startDateTime: string
  endDateTime: string
  launchTokenSymbol: string
  launchTokenPriceUsdRaw: string
  onPriceChange: (prices: LbpPrice[]) => void
}

export function FixedProjectedPrice({
  startDateTime,
  endDateTime,
  launchTokenPriceUsdRaw,
  onPriceChange,
}: Props) {
  const daysDiff = differenceInDays(parseISO(endDateTime), parseISO(startDateTime))
  const hoursDiff =
    differenceInHours(parseISO(endDateTime), parseISO(startDateTime)) - daysDiff * 24
  const salePeriodText =
    startDateTime && endDateTime
      ? `Sale period: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''}`
      : ''

  const prices = useMemo<LbpPrice[]>(() => {
    if (!startDateTime || !endDateTime || !launchTokenPriceUsdRaw) return []

    const start = parseISO(startDateTime)
    const end = parseISO(endDateTime)

    const data: LbpPrice[] = []
    let current = start

    while (isBefore(current, end)) {
      data.push({ timestamp: current, projectTokenPrice: Number(launchTokenPriceUsdRaw) })
      current = addHours(current, 24)
    }

    if (data.length === 0 || !isEqual(data[data.length - 1].timestamp, end)) {
      data.push({ timestamp: end, projectTokenPrice: Number(launchTokenPriceUsdRaw) })
    }

    return data
  }, [endDateTime, launchTokenPriceUsdRaw, startDateTime])

  useEffect(() => {
    if (prices.length > 0) onPriceChange(prices)
  }, [onPriceChange, prices])

  return (
    <Card h="450px">
      <CardHeader>
        <HStack>
          <Heading size="sm">Projected price</Heading>
          <Spacer />
          <Text color="font.secondary" fontWeight="bold" letterSpacing="-0.04rem">
            Fixed price LBP
          </Text>
        </HStack>
      </CardHeader>
      <CardBody display="flex" flexDirection="column" gap="2">
        <Box flex="1" minH="280px">
          <FixedProjectedPriceChart
            endDateTime={parseISO(endDateTime)}
            gridLeft="11%"
            prices={prices}
            startDateTime={parseISO(startDateTime)}
          />
        </Box>
        <Divider />
        <HStack mt="2">
          <HStack>
            <Box height="2px" overflow="hidden" position="relative" width="15px">
              <Box bgGradient="linear(to-r, #B3AEF5, #EAA879)" inset="0" position="absolute" />
            </Box>
            <Text fontSize="sm">Fixed sale price</Text>
          </HStack>
          <Spacer />
          <Text color="font.secondary" fontSize="sm">
            {salePeriodText}
          </Text>
        </HStack>
      </CardBody>
    </Card>
  )
}
