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
import { ProjectedPriceChart } from '../sale-structure/ProjectedPriceChart'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { useState } from 'react'
import { differenceInDays, differenceInHours, parseISO } from 'date-fns'
import { LbpPrice, max } from '../../pool/usePriceInfo'
import { interpolatePrices } from '@repo/lib/modules/pool/LbpDetail/LbpPoolCharts/chart.helper'

type Props = {
  startDateTime: string
  endDateTime: string
  startWeight: number
  endWeight: number
  launchTokenSymbol: string
  launchTokenSeed: number
  collateralTokenSeed: number
  collateralTokenPrice: number
  onPriceChange: (prices: LbpPrice[]) => void
}

export function ProjectedPrice({
  startDateTime,
  endDateTime,
  startWeight,
  endWeight,
  launchTokenSymbol,
  launchTokenSeed,
  collateralTokenSeed,
  collateralTokenPrice,
  onPriceChange,
}: Props) {
  const [maxPrice, setMaxPrice] = useState('')
  const updateMaxPrice = (prices: LbpPrice[]) => {
    setMaxPrice(fNum('fiat', max(prices)))
  }

  const daysDiff = differenceInDays(parseISO(endDateTime), parseISO(startDateTime))
  const hoursDiff =
    differenceInHours(parseISO(endDateTime), parseISO(startDateTime)) - daysDiff * 24
  const salePeriodText =
    startDateTime && endDateTime
      ? `Sale period: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''}`
      : ''

  const prices = interpolatePrices(
    startWeight,
    endWeight,
    parseISO(startDateTime),
    parseISO(endDateTime),
    launchTokenSeed,
    collateralTokenSeed,
    collateralTokenPrice
  )

  return (
    <Card h="450px">
      <CardHeader>
        <HStack>
          <Heading size="sm">Projected price</Heading>
          <Spacer />
          <Text color="font.secondary" fontWeight="bold">
            {`Starting price: $${maxPrice}`}
          </Text>
        </HStack>
      </CardHeader>
      <CardBody>
        <ProjectedPriceChart
          endDateTime={parseISO(endDateTime)}
          gridLeft="11%"
          onPriceChange={prices => {
            updateMaxPrice(prices)
            onPriceChange(prices)
          }}
          prices={prices}
          startDateTime={parseISO(startDateTime)}
        />

        <Divider />

        <HStack mt="2">
          <hr
            style={{
              width: '15px',
              border: '1px dashed',
              borderColor: 'linear-gradient(90deg, #194D05 0%, #30940A 100%)',
            }}
          />
          <Text>{`${launchTokenSymbol} projected price (if no demand)`}</Text>
          <Spacer />
          <Text color="font.secondary" fontSize="sm">
            {salePeriodText}
          </Text>
        </HStack>
      </CardBody>
    </Card>
  )
}
