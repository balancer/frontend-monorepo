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
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { TokenSelectPopular } from './TokenSelectPopular'
import { SearchInput } from '@repo/lib/shared/components/inputs/SearchInput'
import { getChainShortName } from '@repo/lib/config/app.config'
import { Address } from 'viem'
import { ApiToken } from '../token.types'

type Props = {
  tokens: ApiToken[]
  chain: GqlChain
  currentToken?: Address
  excludeNativeAsset?: boolean
  pinNativeAsset?: boolean
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement>
  onTokenSelect: (token: ApiToken) => void
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

  function closeOnSelect(token: ApiToken) {
    onTokenSelect(token)
    closeModal()
  }

  function closeModal() {
    setSearchTerm('')
    onClose()
  }

  return (
    <Modal
      finalFocusRef={finalFocusRef}
      isCentered
      isOpen={isOpen}
      onClose={closeModal}
      preserveScrollBarGap
      {...rest}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="font.primary">Select a token: {getChainShortName(chain)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0}>
          <VStack align="start" spacing="md" w="full">
            <Box px="md" w="full">
              <SearchInput
                ariaLabel="search for a token"
                placeholder="Search by name, symbol or address"
                search={searchTerm}
                setSearch={setSearchTerm}
                tabIndex={0}
              />
            </Box>
            {!searchTerm && (
              <Box px="md" w="full">
                <TokenSelectPopular
                  chain={chain}
                  currentToken={currentToken}
                  excludeNativeAsset={excludeNativeAsset}
                  onTokenSelect={closeOnSelect}
                />
              </Box>
            )}
            <Box pr="0" w="full">
              <TokenSelectList
                chain={chain}
                currentToken={currentToken}
                excludeNativeAsset={excludeNativeAsset}
                listHeight={500}
                onTokenSelect={closeOnSelect}
                pinNativeAsset={pinNativeAsset}
                searchTerm={searchTerm}
                tokens={tokens}
              />
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
