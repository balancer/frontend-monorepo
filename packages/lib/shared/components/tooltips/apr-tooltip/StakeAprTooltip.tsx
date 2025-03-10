import { Card, HStack, Text, VStack } from '@chakra-ui/react'
import BaseAprTooltip from './BaseAprTooltip'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useCallback } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import BigNumber from 'bignumber.js'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { calcPotentialYieldFor } from '@repo/lib/modules/pool/pool.utils'
import { SparklesIcon } from './MainAprTooltip'

interface Props {
  totalUsdValue: string
  pool: Pool
  weeklyRewards?: number
}

function StakeAprTooltip({ pool, totalUsdValue, weeklyRewards }: Props) {
  const potentialYield = calcPotentialYieldFor(pool, totalUsdValue)
  const weeklyYield =
    weeklyRewards && bn(potentialYield).gt(weeklyRewards) ? weeklyRewards : potentialYield

  const { toCurrency } = useCurrency()

  const numberFormatter = useCallback(
    (value: string) => bn(value).times(totalUsdValue).dividedBy(52),
    [totalUsdValue]
  )

  const displayValueFormatter = useCallback(
    (value: BigNumber) => toCurrency(value.toString(), { abbreviated: false }),
    [toCurrency]
  )

  return (
    <BaseAprTooltip
      aprItems={pool.dynamicData.aprItems}
      chain={pool.chain}
      displayValueFormatter={displayValueFormatter}
      maxVeBalText="Total with max veBAL"
      numberFormatter={numberFormatter}
      placement="top-start"
      poolId={pool.id}
      poolType={pool.type}
      shouldDisplayBaseTooltip
      shouldDisplayMaxVeBalTooltip
      totalBaseText="Total weekly base"
      totalBaseVeBalText="Total weekly base"
      totalVeBalTitle="Total weekly"
      usePortal={false}
      vebalBoost="1"
    >
      <Card cursor="pointer" variant="subSection" w="full">
        <VStack align="start" spacing="sm" w="full">
          <Text>Potential yield (1w)</Text>
          <HStack>
            <Text fontSize="lg" fontWeight="bold" variant="special">
              {weeklyYield ? toCurrency(weeklyYield, { abbreviated: false }) : '-'}
            </Text>
            <SparklesIcon isOpen={false} pool={pool} />
          </HStack>
        </VStack>
      </Card>
    </BaseAprTooltip>
  )
}

export default StakeAprTooltip
