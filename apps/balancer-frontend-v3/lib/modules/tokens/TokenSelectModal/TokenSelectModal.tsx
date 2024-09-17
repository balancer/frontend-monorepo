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
import { RefObject, useState } from 'react'
import { TokenSelectList } from './TokenSelectList/TokenSelectList'
import { GqlChain, GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { TokenSelectPopular } from './TokenSelectPopular'
import { SearchInput } from '@/lib/shared/components/inputs/SearchInput'
import { getChainShortName } from '@/lib/config/app.config'
import { Address } from 'viem'

type Props = {
  tokens: GqlToken[]
  chain: GqlChain
  currentToken?: Address
  excludeNativeAsset?: boolean
  pinNativeAsset?: boolean
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement>
  onTokenSelect: (token: GqlToken) => void
}

export function TokenSelectModal({
  tokens,
  chain,
  currentToken,
  excludeNativeAsset = false,
  pinNativeAsset = false,
  isOpen,
  onClose,
  finalFocusRef,
  onTokenSelect,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const [searchTerm, setSearchTerm] = useState('')

  function closeOnSelect(token: GqlToken) {
    onTokenSelect(token)
    closeModal()
  }

  function closeModal() {
    setSearchTerm('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      finalFocusRef={finalFocusRef}
      isCentered
      preserveScrollBarGap
      {...rest}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="font.primary">Select a token: {getChainShortName(chain)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0}>
          <VStack w="full" align="start" spacing="md">
            <Box px="md" w="full">
              <SearchInput
                search={searchTerm}
                setSearch={setSearchTerm}
                placeholder="Search by name, symbol or address"
                ariaLabel="search for a token"
                tabIndex={1}
              />
            </Box>
            {!searchTerm && (
              <Box px="md" w="full">
                <TokenSelectPopular
                  chain={chain}
                  excludeNativeAsset={excludeNativeAsset}
                  onTokenSelect={closeOnSelect}
                  currentToken={currentToken}
                />
              </Box>
            )}
            <Box pr="0" w="full">
              <TokenSelectList
                chain={chain}
                tokens={tokens}
                excludeNativeAsset={excludeNativeAsset}
                pinNativeAsset={pinNativeAsset}
                listHeight={500}
                searchTerm={searchTerm}
                currentToken={currentToken}
                onTokenSelect={closeOnSelect}
              />
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
