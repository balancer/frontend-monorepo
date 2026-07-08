'use client'

import { Box, Card, Flex, HStack, Heading, Skeleton, Text, VStack } from '@chakra-ui/react'
import { getChainShortName } from '@repo/lib/config/app.config'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useChainProtocolStats } from '@analytics/lib/hooks/useChainProtocolStats'
import { CHAIN_COLORS } from './chainColors'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)

export function TvlByChainBars() {
  const { data, loading } = useChainProtocolStats()
  const rows = (data ?? [])
    .map(d => ({ chain: d.chain, tvl: Number(d.totalLiquidity || 0) }))
    .filter(r => r.tvl > 0)
    .sort((a, b) => b.tvl - a.tvl)
  const total = rows.reduce((a, b) => a + b.tvl, 0) || 1

  return (
    <Card display="flex" flexDirection="column" h="full" variant="level1">
      <Flex align="center" justify="space-between" mb="md">
        <Heading size="h6">TVL by chain</Heading>
        <Text color="font.secondary" fontSize="xs">
          {rows.length} chains
        </Text>
      </Flex>
      {loading ? (
        <Skeleton flex={1} minH="200px" />
      ) : (
        <VStack align="stretch" flex={1} justify="center" spacing="ms">
          {rows.map(r => {
            const color = CHAIN_COLORS[r.chain] ?? '#718096'
            const pct = r.tvl / total
            return (
              <Box
                alignItems="center"
                display="grid"
                gap="ms"
                gridTemplateColumns="120px 1fr 100px"
                key={r.chain}
              >
                <HStack spacing="xs">
                  <NetworkIcon chain={r.chain} size={5} />
                  <Text color="font.secondary" fontSize="sm">
                    {getChainShortName(r.chain)}
                  </Text>
                </HStack>
                <Box bg="background.level0" borderRadius="full" h="6px" overflow="hidden">
                  <Box
                    bgGradient={`linear(to-r, ${color}, ${color}cc)`}
                    borderRadius="full"
                    boxShadow={`0 0 12px ${color}55`}
                    h="100%"
                    w={`${pct * 100}%`}
                  />
                </Box>
                <Flex align="baseline" gap="xs" justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">
                    {usd(r.tvl)}
                  </Text>
                  <Text color="font.secondary" fontSize="xs">
                    {(pct * 100).toFixed(1)}%
                  </Text>
                </Flex>
              </Box>
            )
          })}
        </VStack>
      )}
    </Card>
  )
}
