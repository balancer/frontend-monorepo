'use client'

import { HStack, Input, InputProps, Text, VStack } from '@chakra-ui/react'
import { BalPopover } from '../popover/BalPopover'
import { InfoIcon } from '../icons/InfoIcon'

type InputWithErrorProps = {
  error?: string
  info?: string
  label?: string
  tooltip?: string
} & InputProps

export function InputWithError({ error, info, label, tooltip, ...props }: InputWithErrorProps) {
  return (
    <VStack align="start" w="full">
      {label && (
        <HStack>
          <Text textAlign="start" w="full">
            {label}
          </Text>
          {tooltip && (
            <BalPopover text={tooltip}>
              <InfoIcon />
            </BalPopover>
          )}
        </HStack>
      )}
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
