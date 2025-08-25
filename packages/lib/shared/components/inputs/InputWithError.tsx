'use client'

import {
  HStack,
  Input,
  InputProps,
  Text,
  VStack,
  InputRightElement,
  Button,
} from '@chakra-ui/react'
import { BalPopover } from '../popover/BalPopover'
import { InfoIcon } from '../icons/InfoIcon'

type InputWithErrorProps = {
  error?: string
  info?: string
  label?: string
  tooltip?: string
  pasteFn?: () => void
} & InputProps

export function InputWithError({
  error,
  info,
  label,
  tooltip,
  pasteFn,
  ...props
}: InputWithErrorProps) {
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

      {pasteFn && (
        <InputRightElement w="max-content">
          <Button
            aria-label="paste"
            h="28px"
            letterSpacing="0.25px"
            lineHeight="1"
            mr="0.5"
            onClick={pasteFn}
            position="relative"
            px="2"
            right="3px"
            rounded="sm"
            size="sm"
            top="29px"
            variant="tertiary"
          >
            Paste
          </Button>
        </InputRightElement>
      )}

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
