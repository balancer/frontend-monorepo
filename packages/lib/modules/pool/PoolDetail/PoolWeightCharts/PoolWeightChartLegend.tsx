import { Box, HStack, Text } from '@chakra-ui/react'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { getTokenColor } from '@repo/lib/styles/token-colors'
import { Address } from 'viem'

export default function PoolWeightChartLegend({ displayTokens }: { displayTokens: ApiToken[] }) {
  return (
    <HStack justify="center" mt="4" spacing="4" wrap="wrap" zIndex={2}>
      {displayTokens.map((token, i) => {
        return (
          <Box
            background="none"
            fontSize="1rem"
            fontWeight="normal"
            key={`token-weight-chart-legend-${token.symbol}`}
          >
            <HStack spacing="1">
              <Box
                bg={getTokenColor(token.chain, token.address as Address, i).from}
                height="8px"
                rounded="full"
                width="8px"
              />
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
