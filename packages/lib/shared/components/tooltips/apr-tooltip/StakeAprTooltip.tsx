import { Card, HStack, Text, VStack } from '@chakra-ui/react'
import BaseAprTooltip from './BaseAprTooltip'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useCallback } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import BigNumber from 'bignumber.js'
import { Pool } from '@repo/lib/modules/pool/PoolProvider'
import { calcPotentialYieldFor } from '@repo/lib/modules/pool/pool.utils'
import { SparklesIcon } from './MainAprTooltip'

interface Props {
  totalUsdValue: string
  pool: Pool
}

function StakeAprTooltip({ pool, totalUsdValue }: Props) {
  const weeklyYield = calcPotentialYieldFor(pool, totalUsdValue)

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
      poolId={pool.id}
      totalBaseText="Total weekly base"
      totalBaseVeBalText="Total weekly base"
      totalVeBalTitle="Total weekly"
      maxVeBalText="Total with max veBAL"
      placement="top-start"
      vebalBoost="1"
      numberFormatter={numberFormatter}
      displayValueFormatter={displayValueFormatter}
      shouldDisplayBaseTooltip
      shouldDisplayMaxVeBalTooltip
      usePortal={false}
      poolType={pool.type}
    >
      <Card cursor="pointer" variant="subSection" w="full">
        <VStack align="start" w="full" spacing="sm">
          <Text>Potential yield (1w)</Text>
          <HStack>
            <Text variant="special" fontSize="lg" fontWeight="bold">
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
