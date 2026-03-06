import { HStack, Heading } from '@chakra-ui/react'
import { Tooltip } from '../../../shared/components/tooltips/Tooltip'
import { AlertTriangle } from 'react-feather'
import { usePoolTokenPriceWarnings } from '../usePoolTokenPriceWarnings'

export function PoolTotalLiquidityDisplay({
  totalLiquidity,
  size = 'h4',
}: {
  totalLiquidity: string
  size?: 'h4' | 'h5'
}) {
  const { totalLiquidityTip, isAnyTokenWithoutPrice } = usePoolTokenPriceWarnings()

  const fontColor = isAnyTokenWithoutPrice ? 'font.warning' : 'font.primary'

  return (
    <HStack color={fontColor} gap="xs">
      <Heading color={fontColor} size={size}>
        {totalLiquidity}
      </Heading>
      {isAnyTokenWithoutPrice && (
        <Tooltip
          content={totalLiquidityTip}
          positioning={{
            placement: 'top',
          }}
        >
          <AlertTriangle size={22} />
        </Tooltip>
      )}
    </HStack>
  )
}
