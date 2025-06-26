import { usePool } from '../PoolProvider'
import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'
import {
  differenceInDays,
  differenceInHours,
  isAfter,
  isBefore,
  secondsToMilliseconds,
} from 'date-fns'
import { Divider, HStack, Text, VStack } from '@chakra-ui/react'
import { ProjectedPriceChart } from '@repo/lib/modules/lbp/steps/sale-structure/ProjectedPriceChart'
import {
  getCurrentPrice,
  LbpPrice,
  max,
  usePriceInfo,
} from '@repo/lib/modules/lbp/pool/usePriceInfo'
import { Address } from 'viem'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { now } from '@repo/lib/shared/utils/time'

export function LbpPriceChart() {
  const { pool } = usePool()
  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3

  const startTime = new Date(secondsToMilliseconds(lbpPool.startTime))
  const endTime = new Date(secondsToMilliseconds(lbpPool.endTime))
  const now = new Date()
  const isSaleOngoing = isAfter(now, startTime) && isBefore(now, endTime)
  const daysDiff = differenceInDays(endTime, isSaleOngoing ? now : startTime)
  const hoursDiff = differenceInHours(endTime, isSaleOngoing ? now : startTime) - daysDiff * 24
  const salePeriodText = isSaleOngoing
    ? `Sale: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''} remaining`
    : `Sale period: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''}`

  const { prices } = usePriceInfo(pool.chain, pool.id as Address)

  return (
    <VStack>
      <ProjectedPriceChart cutTime={now} endDate={endTime} prices={prices} startDate={startTime} />
      <Divider />
      <HStack mt="2" w="full">
        <hr
          style={{
            width: '15px',
            border: '1px solid',
            borderColor: 'linear-gradient(90deg, #194D05 0%, #30940A 100%)',
          }}
        />
        <Text>{`Spot price`}</Text>
        <hr
          style={{
            width: '15px',
            border: '1px dashed',
            borderColor: 'linear-gradient(90deg, #194D05 0%, #30940A 100%)',
          }}
        />
        <Text>{`Projected price with no buys`}</Text>
        <Text color="font.secondary" fontSize="sm" ml="auto">
          {salePeriodText}
        </Text>
      </HStack>
    </VStack>
  )
}

export function PriceInfo({ prices }: { prices: LbpPrice[] }) {
  const currentPrice = getCurrentPrice(prices)
  const currentTime = now()
  const hasPrices = prices.length > 0

  return (
    <VStack alignItems="end" spacing="0.5">
      <Text fontSize="24px" fontWeight="bold">
        {`$${fNum('fiat', currentPrice, { forceThreeDecimals: true })}`}
      </Text>
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
  return (((newValue - oldValue) / oldValue) * 100).toFixed(2)
}
