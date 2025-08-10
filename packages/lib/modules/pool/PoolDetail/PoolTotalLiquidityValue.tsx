import { HStack, Heading, Tooltip } from '@chakra-ui/react'
import { AlertTriangle } from 'react-feather'
import { usePoolTokenPriceWarnings } from '../usePoolTokenPriceWarnings'

export function PoolTotalLiquidityValue({
  totalLiquidity,
  size = 'h4',
}: {
  totalLiquidity: string
  size?: 'h4' | 'h5'
}) {
  const { totalLiquidityTip, isAnyTokenWithoutPrice } = usePoolTokenPriceWarnings()

  const fontColor = isAnyTokenWithoutPrice ? 'font.warning' : 'font.primary'

  return (
    <HStack color={fontColor} spacing="xs">
      <Heading color={fontColor} size={size}>
        {totalLiquidity}
      </Heading>
      {isAnyTokenWithoutPrice && (
        <Tooltip label={totalLiquidityTip} placement="top">
          <AlertTriangle size={22} />
        </Tooltip>
      )}
    </HStack>
  )
}
