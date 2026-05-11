'use client'

import { Card, Flex, HStack, Heading, Tag, Text, VStack } from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useBoostedPools } from '@analytics/lib/hooks/useBoostedPools'

export function BoostedHighlight() {
  const { data, count } = useBoostedPools({ limit: 4 })
  const avg = data.length ? data.reduce((s, p) => s + p.apr, 0) / data.length : 0

  return (
    <Card overflow="hidden" position="relative" variant="level1">
      <Flex align="flex-start" justify="space-between" mb="md">
        <VStack align="flex-start" spacing="xs">
          <HStack spacing="xs">
            <Text
              as="span"
              bgClip="text"
              bgGradient="linear(to-br, sparkles.corePool.from, sparkles.corePool.to)"
            >
              ✦
            </Text>
            <Heading size="h6">Boosted pools</Heading>
          </HStack>
          <Text color="font.secondary" fontSize="xs">
            v3 yield-bearing wrappers
          </Text>
        </VStack>
        <Tag colorScheme="yellow" size="sm" variant="subtle">
          {count}+ live
        </Tag>
      </Flex>

      <HStack align="baseline" mb="md" spacing="sm">
        <Heading color="font.maxContrast" letterSpacing="-0.6px" size="h4">
          {(avg * 100).toFixed(2)}%
        </Heading>
        <Text color="font.secondary" fontSize="xs">
          avg APR · top boosted
        </Text>
      </HStack>

      <VStack align="stretch" spacing="xs">
        {data.map((p, i) => (
          <Flex
            align="center"
            borderColor="border.subduedZen"
            borderTop={i ? '1px dashed' : 'none'}
            justify="space-between"
            key={p.id}
            py="xs"
          >
            <HStack minW={0} spacing="sm">
              <NetworkIcon chain={p.chain} size={4} />
              <Text color="font.secondary" fontSize="sm" noOfLines={1}>
                {p.name}
              </Text>
            </HStack>
            <Text color="font.maxContrast" fontSize="sm" fontWeight="medium">
              {(p.apr * 100).toFixed(2)}%{' '}
              <Text
                as="span"
                bgClip="text"
                bgGradient="linear(to-br, sparkles.corePool.from, sparkles.corePool.to)"
              >
                ✦
              </Text>
            </Text>
          </Flex>
        ))}
      </VStack>
    </Card>
  )
}
