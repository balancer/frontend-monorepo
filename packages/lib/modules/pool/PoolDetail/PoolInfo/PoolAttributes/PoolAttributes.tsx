'use client'

import { Box, Card, Stack, Heading, Text, VStack, Divider, HStack, Link } from '@chakra-ui/react'
import { useFormattedPoolAttributes } from './useFormattedPoolAttributes'
import { ArrowUpRight } from 'react-feather'

export function PoolAttributes() {
  const formattedAttributes = useFormattedPoolAttributes()

  return (
    <Card>
      <VStack alignItems="flex-start" spacing={{ base: 'sm', md: 'md' }} width="full">
        <Heading fontSize="1.25rem" variant="h4">
          Pool attributes
        </Heading>
        <Divider />
        <VStack width="full">
          {formattedAttributes.map(attribute => {
            return (
              <Stack
                direction={{ base: 'column', md: 'row' }}
                key={`pool-attribute-${attribute.title}`}
                spacing={{ base: 'xxs', md: 'xl' }}
                width="full"
              >
                <Box minWidth="160px">
                  <Text variant={{ base: 'primary', md: 'secondary' }}>{attribute.title}:</Text>
                </Box>
                {attribute.link ? (
                  <Link href={attribute.link} target="_blank" variant="link">
                    <HStack gap="xxs">
                      <Text color="link">{attribute.value}</Text>
                      <ArrowUpRight size={12} />
                    </HStack>
                  </Link>
                ) : (
                  <Text
                    mb={{ base: 'sm', md: '0' }}
                    variant={{ base: 'secondary', md: 'secondary' }}
                  >
                    {attribute.value}
                  </Text>
                )}
              </Stack>
            )
          })}
        </VStack>
      </VStack>
    </Card>
  )
}
