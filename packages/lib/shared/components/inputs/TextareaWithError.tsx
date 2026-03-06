'use client'

import { Box, Text, Textarea, TextareaProps } from '@chakra-ui/react'

export function TextareaWithError({
  error,
  isInvalid,
  isDisabled,
  ...props
}: { error?: string; isInvalid?: boolean; isDisabled?: boolean } & TextareaProps) {
  return (
    <>
      <Textarea disabled={isDisabled} invalid={isInvalid} {...props} />
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
