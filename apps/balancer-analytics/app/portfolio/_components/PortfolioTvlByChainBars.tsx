'use client'

import { Box, Card, Flex, HStack, Heading, Text, VStack } from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { CHAIN_COLORS } from '../../_components/chainColors'
import type { ChainAggregate } from '@analytics/lib/hooks/usePortfolioByAddress'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n)

const labelize = (chain: string) => chain.charAt(0) + chain.slice(1).toLowerCase()

export function PortfolioTvlByChainBars({
  chains,
  totalUsd,
}: {
  chains: ChainAggregate[]
  totalUsd: number
}) {
  return (
    <Card h="full" variant="level1">
      <Flex align="center" flexWrap="wrap" gap="xs" justify="space-between" mb="md">
        <Heading size="h6">Value by chain</Heading>
        <Text color="font.secondary" fontSize="xs">
          {chains.length} {chains.length === 1 ? 'chain' : 'chains'}
        </Text>
      </Flex>
      {chains.length === 0 ? (
        <Text color="font.secondary" fontSize="sm">
          No active positions.
        </Text>
      ) : (
        <VStack align="stretch" spacing="sm">
          {chains.map(c => {
            // Normalise widths against the largest chain (not the total) so a
            // single-chain wallet still shows a full bar instead of a sliver.
            const max = chains[0]?.positionUsd || 1
            const widthPct = max > 0 ? (c.positionUsd / max) * 100 : 0
            const sharePct = totalUsd > 0 ? (c.positionUsd / totalUsd) * 100 : 0
            const color = CHAIN_COLORS[c.chain] ?? '#718096'
            return (
              <Box key={c.chain}>
                <Flex align="center" justify="space-between" mb="xs">
                  <HStack spacing="xs">
                    <NetworkIcon chain={c.chain} size={4} />
                    <Text fontSize="sm" fontWeight="medium">
                      {labelize(c.chain)}
                    </Text>
                    <Text color="font.secondary" fontSize="xs">
                      · {c.count} {c.count === 1 ? 'position' : 'positions'}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="medium">
                    {usd(c.positionUsd)}
                  </Text>
                </Flex>
                <Box bg="background.level0" borderRadius="full" h="6px" overflow="hidden" w="full">
                  <Box
                    bg={color}
                    h="full"
                    rounded="full"
                    transition="width 0.4s ease"
                    w={`${widthPct}%`}
                  />
                </Box>
                <Text color="font.tertiary" fontSize="2xs" mt="xs">
                  {sharePct.toFixed(1)}% of portfolio
                </Text>
              </Box>
            )
          })}
        </VStack>
      )}
    </Card>
  )
}
