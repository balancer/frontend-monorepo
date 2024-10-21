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
import { GqlChain, GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { CompactTokenSelectList } from './TokenSelectModal/TokenSelectList/CompactTokenSelectList'

type Props = {
  chain: GqlChain
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement>
  onTokenSelect: (token: GqlToken) => void
  nativeAssets: GqlToken[]
}

export function NativeAssetSelectModal({
  isOpen,
  onClose,
  finalFocusRef,
  onTokenSelect,
  nativeAssets,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  function closeOnSelect(token: GqlToken) {
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
              <CompactTokenSelectList onTokenSelect={closeOnSelect} tokens={nativeAssets} />
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
