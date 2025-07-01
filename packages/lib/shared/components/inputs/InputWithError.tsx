'use client'

import { Input, InputProps, Text, VStack } from '@chakra-ui/react'

export function InputWithError({
  error,
  info,
  ...props
}: { error?: string; info?: string } & InputProps) {
  return (
    <VStack w="full">
      <Input {...props} />

      {error && (
        <Text color="font.error" fontSize="sm" textAlign="start" w="full">
          {error}
        </Text>
      )}

      {!error && info && (
        <Text color="font.secondary" fontSize="sm" textAlign="start" w="full">
          {info}
        </Text>
      )}
    </VStack>
  )
}
