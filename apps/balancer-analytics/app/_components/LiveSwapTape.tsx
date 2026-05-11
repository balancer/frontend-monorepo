'use client'

import { Box, Card, Flex, HStack, Heading, Tag, Text, VStack } from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useLiveSwaps } from '@analytics/lib/hooks/useLiveSwaps'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(n)

export function LiveSwapTape() {
  const { items } = useLiveSwaps({ limit: 10 })

  return (
    <Card variant="level1">
      <Flex align="center" justify="space-between" mb="md">
        <HStack spacing="sm">
          <Heading size="h6">Live swaps</Heading>
          <Tag colorScheme="green" size="sm" variant="subtle">
            streaming
          </Tag>
        </HStack>
        <Text color="font.secondary" fontSize="xs">
          last 10
        </Text>
      </Flex>
      <VStack align="stretch" spacing="xxs">
        {items.map(s => (
          <Box
            _hover={{ bg: 'background.level0' }}
            alignItems="center"
            borderRadius="md"
            display="grid"
            gap="ms"
            gridTemplateColumns="24px 1fr auto auto"
            key={s.id}
            px="xs"
            py="xs"
            transition="background 0.15s"
          >
            <NetworkIcon chain={s.chain} size={5} />
            <VStack align="flex-start" minW={0} spacing={0}>
              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                {s.tokenIn} → {s.tokenOut}
              </Text>
              <Text color="font.secondary" fontSize="xs" noOfLines={1}>
                via {s.poolName}
              </Text>
            </VStack>
            <Text
              color={s.usdValue > 50_000 ? 'green.400' : 'font.maxContrast'}
              fontSize="sm"
              fontWeight="medium"
            >
              {usd(s.usdValue)}
            </Text>
            <Text color="font.secondary" fontSize="xs" minW="32px" textAlign="right">
              {s.relativeTime}
            </Text>
          </Box>
        ))}
      </VStack>
    </Card>
  )
}
