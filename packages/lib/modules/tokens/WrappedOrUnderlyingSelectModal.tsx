'use client'

import {
  Box,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Text,
  VStack,
} from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { RefObject } from 'react'
import { CompactTokenSelectList } from './TokenSelectModal/TokenSelectList/CompactTokenSelectList'
import { ApiToken } from './token.types'

type Props = {
  chain: GqlChain
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
  onTokenSelect: (token: ApiToken) => void
  tokens: ApiToken[]
}

export function WrappedOrUnderlyingSelectModal({
  isOpen,
  onClose,
  finalFocusRef,
  onTokenSelect,
  tokens,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  function closeOnSelect(token: ApiToken) {
    onClose()
    onTokenSelect(token)
  }

  return (
    <Modal
      finalFocusRef={finalFocusRef}
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      {...rest}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="font.primary">Select a token</ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0}>
          <VStack spacing="md" w="full">
            <Box px="md" w="full">
              <CompactTokenSelectList onTokenSelect={closeOnSelect} tokens={tokens} />
            </Box>
            <Divider w="90%" />
            <Text color="font.secondary" p="md" pt="0">
              This Boosted pool wraps the underlying token into yield bearing tokens. You can use
              either token to enter or exit a pool.
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
