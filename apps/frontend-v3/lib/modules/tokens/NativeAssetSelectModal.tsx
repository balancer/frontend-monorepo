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
import { GqlChain, GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { NativeAssetSelectList } from './NativeAssetSelectList'

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
      isOpen={isOpen}
      onClose={onClose}
      finalFocusRef={finalFocusRef}
      isCentered
      preserveScrollBarGap
      {...rest}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="font.primary">Select a token</ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0}>
          <VStack w="full" align="start" spacing="md">
            <Box px="md" w="full">
              <NativeAssetSelectList tokens={nativeAssets} onTokenSelect={closeOnSelect} />
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
