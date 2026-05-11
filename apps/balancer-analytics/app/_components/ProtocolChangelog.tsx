'use client'

import { Box, Card, Flex, HStack, Heading, IconButton, Tag, Text, VStack } from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { useProtocolChangelog } from '@analytics/lib/hooks/useProtocolChangelog'

const TAG_COLOR: Record<string, string> = {
  v3: 'green.400',
  v2: 'gray.400',
  gov: 'orange.300',
  infra: 'purple.300',
}

export function ProtocolChangelog() {
  const { items } = useProtocolChangelog({ limit: 4 })

  return (
    <Card variant="level1">
      <Flex align="center" justify="space-between" mb="md">
        <HStack spacing="xs">
          <Heading size="h6">Protocol changes</Heading>
          <Tag colorScheme="orange" size="sm" variant="subtle">
            WIP
          </Tag>
        </HStack>
        <Text color="font.secondary" fontSize="xs">
          last 30d
        </Text>
      </Flex>
      <VStack align="stretch" spacing={0}>
        {items.map((it, i) => {
          const color = TAG_COLOR[it.tag] ?? 'font.secondary'
          return (
            <Flex
              align="flex-start"
              borderBottom={i < items.length - 1 ? '1px dashed' : 'none'}
              borderColor="border.subduedZen"
              gap="ms"
              key={it.id}
              py="ms"
            >
              <Box
                bg={color}
                borderRadius="full"
                flexShrink={0}
                h="8px"
                mt="xs"
                w="8px"
              />
              <Box flex={1} minW={0}>
                <Text color="font.primary" fontSize="sm" lineHeight="short">
                  {it.title}
                </Text>
                <Text color="font.secondary" fontSize="xs" mt="xxs">
                  <Text as="span" color={color} textTransform="uppercase">
                    {it.tag}
                  </Text>
                  {' · '}
                  {it.relativeTime}
                </Text>
              </Box>
              <IconButton aria-label="open" icon={<ChevronRightIcon />} size="xs" variant="ghost" />
            </Flex>
          )
        })}
      </VStack>
    </Card>
  )
}
