import { Card, HStack, PopoverArrow, PopoverContent, Text, VStack } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useCallback } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import BigNumber from 'bignumber.js'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import BaseAprTooltip, {
  BaseAprTooltipProps,
} from '@repo/lib/shared/components/tooltips/apr-tooltip/BaseAprTooltip'
import { SparklesIcon } from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'

interface Props
  extends Omit<
    BaseAprTooltipProps,
    | 'children'
    | 'totalBaseText'
    | 'totalBaseVeBalText'
    | 'maxVeBalText'
    | 'poolId'
    | 'poolType'
    | 'chain'
  > {
  totalUsdValue: string
  weeklyYield: string
  currentWeeklyYield: string
  pool: Pool
}

export function WeeklyYieldTooltip({
  weeklyYield,
  currentWeeklyYield,
  totalUsdValue,
  pool,
  ...props
}: Props) {
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
      <PopoverContent maxWidth="224px" p="3" shadow="3xl" w="fit-content">
        <Text fontSize="sm" fontWeight="500" lineHeight="18px" variant="secondary">
          Enter some amounts of liquidity to add to simulate your potential weekly yield.
        </Text>
        <PopoverArrow bg="background.level3" />
      </PopoverContent>
    ) : undefined

  return (
    <BaseAprTooltip
      {...props}
      chain={pool.chain}
      customPopoverContent={customPopoverContent}
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
      <HStack align="center" alignItems="center">
        <Card cursor="pointer" p={['sm', 'ms']} variant="subSection" w="full">
          <VStack align="start" spacing="sm">
            <Text fontSize="sm" fontWeight="500" lineHeight="16px" variant="special">
              Potential weekly yield
            </Text>
            <HStack spacing="xs">
              <Text color="font.secondary" fontSize="md" fontWeight="700" lineHeight="16px">
                {toCurrency(currentWeeklyYield, { abbreviated: false })}
              </Text>
              <Text color="font.secondary" fontSize="md" fontWeight="700" lineHeight="16px">
                ➔
              </Text>
              <Text fontSize="md" fontWeight="700" lineHeight="16px" variant="special">
                {toCurrency(weeklyYield, { abbreviated: false })}
              </Text>
              <SparklesIcon isOpen={false} pool={pool} />
            </HStack>
          </VStack>
        </Card>
      </HStack>
    </BaseAprTooltip>
  )
}
