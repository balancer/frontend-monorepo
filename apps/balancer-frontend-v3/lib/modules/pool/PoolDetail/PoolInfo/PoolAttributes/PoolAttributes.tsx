'use client'

import { Box, Card, Stack, Heading, Text, VStack, Divider } from '@chakra-ui/react'
import { useFormattedPoolAttributes } from './useFormattedPoolAttributes'

export function PoolAttributes() {
  const formattedAttributes = useFormattedPoolAttributes()

  return (
    <Card>
      <VStack alignItems="flex-start" spacing={{ base: 'sm', md: 'md' }} width="full">
        <Heading variant="h4" fontSize="1.25rem">
          Pool attributes
        </Heading>
        <Divider />
        <VStack width="full">
          {formattedAttributes.map(attribute => {
            return (
              attribute && (
                <Stack
                  width="full"
                  spacing={{ base: 'xxs', md: 'xl' }}
                  key={`pool-attribute-${attribute.title}`}
                  direction={{ base: 'column', md: 'row' }}
                >
                  <Box minWidth="160px">
                    <Text variant={{ base: 'primary', md: 'secondary' }}>{attribute.title}:</Text>
                  </Box>
                  <Text
                    variant={{ base: 'secondary', md: 'secondary' }}
                    mb={{ base: 'sm', md: '0' }}
                  >
                    {attribute.value}
                  </Text>
                </Stack>
              )
            )
          })}
        </VStack>
      </VStack>
    </Card>
  )
}
