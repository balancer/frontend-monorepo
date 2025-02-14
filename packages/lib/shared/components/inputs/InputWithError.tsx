'use client'

import { Box, Input, InputProps, Text } from '@chakra-ui/react'

export function InputWithError({ error, ...props }: { error?: string } & InputProps) {
  return (
    <>
      <Input {...props} />
      <Box height="10px">
        {error && (
          <Text color="font.error" fontSize="sm">
            {error}
          </Text>
        )}
      </Box>
    </>
  )
}
