import { HStack, Heading, Tooltip } from '@chakra-ui/react'
import { AlertTriangle } from 'react-feather'

export function PoolTotalLiquidityValue({ totalLiquidity }: { totalLiquidity: string }) {
  return (
    <HStack color="font.warning" spacing="xs">
      <Heading color="font.warning" size="h4">
        {totalLiquidity}
      </Heading>
      <Tooltip
        label="This amount does not include the value of {LIQD} tokens since the current price cannot be accessed."
        placement="top"
      >
        <AlertTriangle size={22} />
      </Tooltip>
    </HStack>
  )
}
