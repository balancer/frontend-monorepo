'use client'

import { Box, ModalProps, Text, VStack, Separator, Dialog, Portal } from '@chakra-ui/react';
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
    <Dialog.Root
      finalFocusEl={() => finalFocusRef?.current}
      placement='center'
      open={isOpen}
      {...rest}
      onOpenChange={(e: { open: boolean }) => {
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
              <VStack gap="md" w="full">
                <Box px="md" w="full">
                  <CompactTokenSelectList onTokenSelect={closeOnSelect} tokens={tokens} />
                </Box>
                <Separator w="90%" />
                <Text color="font.secondary" p="md" pt="0">
                  This Boosted pool wraps the underlying token into yield bearing tokens. You can use
                  either token to enter or exit a pool.
                </Text>
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>

      </Portal>
    </Dialog.Root>
  );
}
