import {
  HStack,
  Input,
  InputProps,
  Text,
  VStack,
  InputRightElement,
  InputLeftElement,
  Button,
  InputGroup,
} from '@chakra-ui/react'
import { BalPopover } from '../popover/BalPopover'
import { InfoIcon } from '../icons/InfoIcon'

type InputWithErrorProps = {
  error?: string
  info?: string
  label?: string
  tooltip?: string
  pasteFn?: () => void
  isFiatPrice?: boolean
} & InputProps

export function InputWithError({
  error,
  info,
  label,
  tooltip,
  pasteFn,
  isFiatPrice,
  ...props
}: InputWithErrorProps) {
  return (
    <VStack align="start" data-group w="full">
      {label && (
        <HStack>
          <Text fontWeight="bold" textAlign="start" w="full">
            {label}
          </Text>
          {tooltip && (
            <BalPopover text={tooltip}>
              <InfoIcon />
            </BalPopover>
          )}
        </HStack>
      )}

      <InputGroup>
        {isFiatPrice && (
          <InputLeftElement pointerEvents="none">
            <Text>$</Text>
          </InputLeftElement>
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
              variant="tertiary"
            >
              Paste
            </Button>
          </InputRightElement>
        )}
      </InputGroup>

      {error && (
        <Text color="font.error" fontSize="sm" textAlign="start" w="full">
          {error}
        </Text>
      )}

      {!error && info && (
        <Text
          _groupFocusWithin={{ opacity: '1' }}
          _groupHover={{ opacity: '1' }}
          color="font.secondary"
          fontSize="sm"
          opacity="0.5"
          textAlign="start"
          transition="opacity 0.2s var(--ease-out-cubic)"
          w="full"
        >
          {info}
        </Text>
      )}
    </VStack>
  )
}
