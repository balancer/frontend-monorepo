import { HStack, Heading, Tooltip } from '@chakra-ui/react'
import { AlertTriangle } from 'react-feather'
import { usePoolTokenPriceWarnings } from '../usePoolTokenPriceWarnings'

export function PoolTotalLiquidityValue({ totalLiquidity }: { totalLiquidity: string }) {
  const { totalLiquidityTip } = usePoolTokenPriceWarnings()

  return (
    <HStack color="font.warning" spacing="xs">
      <Heading color="font.warning" size="h4">
        {totalLiquidity}
      </Heading>
      <Tooltip label={totalLiquidityTip} placement="top">
        <AlertTriangle size={22} />
      </Tooltip>
    </HStack>
  )
}
