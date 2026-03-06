'use client'

import { Box, Field, Text, Textarea, TextareaProps } from '@chakra-ui/react'

export function TextareaWithError({
  error,
  invalid,
  isDisabled,
  ...props
}: { error?: string; invalid?: boolean; isDisabled?: boolean } & TextareaProps) {
  return (
    <>
      <Field.Root invalid={invalid}>
        <Textarea disabled={isDisabled} {...props} />
      </Field.Root>
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
