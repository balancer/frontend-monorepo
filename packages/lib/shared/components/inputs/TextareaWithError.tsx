'use client'

import { Box, Text, Textarea, TextareaProps } from '@chakra-ui/react'

export function TextareaWithError({ error, ...props }: { error?: string } & TextareaProps) {
  return (
    <>
      <Textarea {...props} />
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
