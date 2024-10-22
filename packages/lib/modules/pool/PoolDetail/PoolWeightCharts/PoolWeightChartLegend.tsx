import { Box, HStack, Text } from '@chakra-ui/react'
import { PoolWeightChartColorDef } from './PoolWeightChart'
import { GqlPoolTokenDetail } from '@repo/lib/shared/services/api/generated/graphql'

export default function PoolWeightChartLegend({
  displayTokens,
  colors = [],
}: {
  displayTokens: GqlPoolTokenDetail[]
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
