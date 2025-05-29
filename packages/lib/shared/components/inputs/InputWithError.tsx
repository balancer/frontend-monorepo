'use client'

import { Input, InputProps, Text, VStack } from '@chakra-ui/react'

export function InputWithError({ error, ...props }: { error?: string } & InputProps) {
  return (
    <VStack w="full">
      <Input {...props} />

      {error && (
        <Text color="font.error" fontSize="sm" textAlign="start" w="full">
          {error}
        </Text>
      )}
    </VStack>
  )
}
