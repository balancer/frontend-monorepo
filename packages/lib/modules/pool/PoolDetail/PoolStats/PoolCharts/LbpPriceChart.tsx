import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { usePool } from '../../../PoolProvider'
import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'
import {
  differenceInDays,
  differenceInHours,
  isAfter,
  isBefore,
  secondsToMilliseconds,
} from 'date-fns'
import { Divider, HStack, Spacer, Text, VStack } from '@chakra-ui/react'
import { ProjectedPriceChart } from '@repo/lib/modules/lbp/steps/sale-structure/ProjectedPriceChart'

export function LbpPriceChart() {
  const { priceFor } = useTokens()

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

  const startWeight = lbpPool.projectTokenStartWeight * 100
  const endWeight = lbpPool.projectTokenEndWeight * 100

  // FIXME: JUANJO this should come from the list of balances first value
  const launchTokenSeed = 10
  const collateralTokenSeed = 1

  return (
    <VStack h="full">
      <ProjectedPriceChart
        collateralTokenPrice={priceFor(lbpPool.reserveToken, lbpPool.chain)}
        collateralTokenSeed={collateralTokenSeed}
        cutTime={now}
        endDate={endTime}
        endWeight={endWeight}
        launchTokenSeed={launchTokenSeed}
        onPriceChange={() => {}}
        startDate={startTime}
        startWeight={startWeight}
      />
      <Spacer />

      <Divider />

      <HStack mt="2" w="full">
        <hr
          style={{
            width: '15px',
            border: '1px dashed',
            borderColor: 'linear-gradient(90deg, #194D05 0%, #30940A 100%)',
          }}
        />
        <Text>{`Projected price with no buys`}</Text>

        <hr
          style={{
            width: '15px',
            border: '1px solid',
            borderColor: 'linear-gradient(90deg, #194D05 0%, #30940A 100%)',
          }}
        />
        <Text>{`Spot price`}</Text>
        <Spacer />
        <Text color="font.secondary" fontSize="sm">
          {salePeriodText}
        </Text>
      </HStack>
    </VStack>
  )
}

export function PriceInfo() {
  return (
    <VStack alignItems="end" spacing="0.5">
      <Text fontSize="24px" fontWeight="bold">
        $?.??
      </Text>
      <Text color="font.error" fontSize="12px">
        -??.??%
      </Text>
    </VStack>
  )
}
