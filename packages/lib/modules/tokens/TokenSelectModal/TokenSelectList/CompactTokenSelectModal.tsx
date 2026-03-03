'use client'

import { Box, ModalProps, VStack, Dialog, Portal } from '@chakra-ui/react';
import { RefObject } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { CompactTokenSelectList } from './CompactTokenSelectList'
import { ApiToken } from '../../token.types'

type Props = {
  chain: GqlChain
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
  onTokenSelect: (token: ApiToken) => void
  tokens: ApiToken[]
}

export function CompactTokenSelectModal({
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
    <Dialog.Root
      finalFocusEl={() => finalFocusRef.current}
      placement='center'
      open={isOpen}
      {...rest}
      onOpenChange={e => {
        if (!e.open) {
          onClose();
        }
      }}>
      <Portal>

        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header color="font.primary">Select a token</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body p={0}>
              <VStack align="start" gap="md" w="full">
                <Box px="md" w="full">
                  <CompactTokenSelectList onTokenSelect={closeOnSelect} tokens={tokens} />
                </Box>
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>

      </Portal>
    </Dialog.Root>
  );
}
