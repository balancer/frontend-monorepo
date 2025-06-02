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

type Props = {
  startTime: string
  endTime: string
  startWeight: number
  endWeight: number
  launchTokenSeed: number
  launchTokenSymbol: string
  collateralTokenSeed: number
  collateralTokenPrice: number
}

export function ProjectedPrice({
  startTime,
  endTime,
  startWeight,
  endWeight,
  launchTokenSeed,
  launchTokenSymbol,
  collateralTokenSeed,
  collateralTokenPrice,
}: Props) {
  const [maxPrice, setMaxPrice] = useState('')
  const updateMaxPrice = (prices: number[][]) => {
    const maxPrice = Math.max(...prices.map(point => point[1]))
    setMaxPrice(fNum('fiat', maxPrice))
  }

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
          <Heading size="sm">Projected price</Heading>
          <Spacer />
          <Text color="font.secondary" fontWeight="bold">
            {`Starting price: $${maxPrice}`}
          </Text>
        </HStack>
      </CardHeader>
      <CardBody>
        <ProjectedPriceChart
          startWeight={startWeight}
          endWeight={endWeight}
          startDate={parseISO(startTime)}
          endDate={parseISO(endTime)}
          launchTokenSeed={launchTokenSeed}
          collateralTokenSeed={collateralTokenSeed}
          collateralTokenPrice={collateralTokenPrice}
          onPriceChange={updateMaxPrice}
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
