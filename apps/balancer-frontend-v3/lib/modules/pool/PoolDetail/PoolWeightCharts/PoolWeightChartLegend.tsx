import { Box, HStack, Text } from '@chakra-ui/react'
import { PoolWeightChartColorDef } from './PoolWeightChart'
import { GqlPoolTokenDetail } from '@/lib/shared/services/api/generated/graphql'

export default function PoolWeightChartLegend({
  displayTokens,
  colors = [],
}: {
  displayTokens: GqlPoolTokenDetail[]
  colors?: PoolWeightChartColorDef[]
}) {
  return (
    <HStack spacing="4" zIndex={2} mt="4">
      {displayTokens.map((token, i) => {
        return (
          <Box
            fontWeight="normal"
            fontSize="1rem"
            background="none"
            key={`token-weight-chart-legend-${token.symbol}`}
          >
            <HStack spacing="1">
              <Box width="8px" height="8px" bg={colors[i].from} rounded="full" />
              <Text whiteSpace="nowrap" color="font.secondary" fontSize="sm">
                {token.symbol}
              </Text>
            </HStack>
          </Box>
        )
      })}
    </HStack>
  )
}
