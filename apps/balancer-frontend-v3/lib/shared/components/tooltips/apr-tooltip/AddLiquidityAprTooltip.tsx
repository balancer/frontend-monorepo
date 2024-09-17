import { Card, HStack, PopoverArrow, PopoverContent, Text, VStack } from '@chakra-ui/react'
import BaseAprTooltip, { BaseAprTooltipProps } from './BaseAprTooltip'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { useCallback } from 'react'
import { bn } from '@/lib/shared/utils/numbers'
import BigNumber from 'bignumber.js'
import { Pool } from '@/lib/modules/pool/PoolProvider'
import { SparklesIcon } from './MainAprTooltip'

interface Props
  extends Omit<
    BaseAprTooltipProps,
    'children' | 'totalBaseText' | 'totalBaseVeBalText' | 'maxVeBalText' | 'poolId'
  > {
  totalUsdValue: string
  weeklyYield: string
  pool: Pool
}

function AddLiquidityAprTooltip({ weeklyYield, totalUsdValue, pool, ...props }: Props) {
  const { toCurrency } = useCurrency()

  const numberFormatter = useCallback(
    (value: string) => bn(value).times(totalUsdValue).dividedBy(52),
    [totalUsdValue]
  )

  const displayValueFormatter = useCallback(
    (value: BigNumber) => toCurrency(value.toString(), { abbreviated: false }),
    [toCurrency]
  )

  const customPopoverContent =
    totalUsdValue === '0' ? (
      <PopoverContent w="fit-content" shadow="3xl" maxWidth={'224px'} p="3">
        <Text variant="secondary" fontSize="sm" lineHeight="18px" fontWeight="500">
          Enter some amounts of liquidity to add to simulate your potential weekly yield.
        </Text>
        <PopoverArrow bg="background.level3" />
      </PopoverContent>
    ) : undefined

  return (
    <BaseAprTooltip
      {...props}
      poolId={pool.id}
      numberFormatter={numberFormatter}
      displayValueFormatter={displayValueFormatter}
      totalBaseText="Total weekly base"
      totalBaseVeBalText="Total weekly base"
      totalVeBalTitle="Total weekly"
      maxVeBalText="Total with max veBAL"
      placement="top-start"
      vebalBoost="1"
      customPopoverContent={customPopoverContent}
      shouldDisplayBaseTooltip
      shouldDisplayMaxVeBalTooltip
      usePortal={false}
    >
      <HStack align="center" alignItems="center">
        <Card cursor="pointer" variant="subSection" w="full" p={['sm', 'ms']}>
          <VStack align="start" spacing="sm">
            <Text variant="special" fontSize="sm" lineHeight="16px" fontWeight="500">
              Potential weekly yield
            </Text>
            <HStack spacing="xs">
              <Text variant="special" fontSize="md" lineHeight="16px" fontWeight="700">
                {weeklyYield ? toCurrency(weeklyYield, { abbreviated: false }) : '-'}
              </Text>
              <SparklesIcon isOpen={false} pool={pool} />
            </HStack>
          </VStack>
        </Card>
      </HStack>
    </BaseAprTooltip>
  )
}

export default AddLiquidityAprTooltip
