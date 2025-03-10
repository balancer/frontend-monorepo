import { Card, Text, VStack } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { CustomPopover } from '@repo/lib/shared/components/popover/CustomPopover'

interface Props {
  totalUsdValue: string
  weeklyYield: string
}

export function AddLiquidityPotentialWeeklyYield({ weeklyYield, totalUsdValue }: Props) {
  const { toCurrency } = useCurrency()

  const popoverEnabled = totalUsdValue === '0'

  return (
    <CustomPopover
      bodyText={
        popoverEnabled
          ? 'Enter some amounts of liquidity to add to simulate your potential weekly yield.'
          : undefined
      }
      trigger={popoverEnabled ? 'hover' : undefined}
    >
      <Card
        cursor={popoverEnabled ? 'pointer' : undefined}
        p={['sm', 'ms']}
        variant="subSection"
        w="full"
      >
        <VStack align="start" spacing="sm">
          <Text fontSize="sm" fontWeight="500" lineHeight="16px" variant="special">
            Potential weekly yield
          </Text>
          <Text fontSize="md" fontWeight="700" lineHeight="16px" variant="special">
            {weeklyYield ? toCurrency(weeklyYield, { abbreviated: false }) : '-'}
          </Text>
        </VStack>
      </Card>
    </CustomPopover>
  )
}
