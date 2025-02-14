'use client'

import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  VStack,
} from '@chakra-ui/react'
import { RefObject } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { CompactTokenSelectList } from './TokenSelectModal/TokenSelectList/CompactTokenSelectList'
import { ApiToken } from './token.types'

type Props = {
  chain: GqlChain
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement>
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
          <VStack align="start" spacing="md" w="full">
            <Box px="md" w="full">
              <CompactTokenSelectList onTokenSelect={closeOnSelect} tokens={tokens} />
            </Box>
            {/* <div color="font.primary">Wrapped or underlying</div> */}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
