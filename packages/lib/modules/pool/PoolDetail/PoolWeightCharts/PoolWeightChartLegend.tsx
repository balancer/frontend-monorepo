import { Box, HStack, Text } from '@chakra-ui/react'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { PoolWeightChartColorDef } from './PoolWeightChart'

export default function PoolWeightChartLegend({
  displayTokens,
  colors = [],
}: {
  displayTokens: ApiToken[]
  colors?: PoolWeightChartColorDef[]
}) {
  return (
    <HStack mt="4" spacing="4" zIndex={2}>
      {displayTokens.map((token, i) => {
        return (
          <Box
            background="none"
            fontSize="1rem"
            fontWeight="normal"
            key={`token-weight-chart-legend-${token.symbol}`}
          >
            <HStack spacing="1">
              <Box bg={colors[i].from} height="8px" rounded="full" width="8px" />
              <Text color="font.secondary" fontSize="sm" whiteSpace="nowrap">
                {token.symbol}
              </Text>
            </HStack>
          </Box>
        )
      })}
    </HStack>
  )
}
