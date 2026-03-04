'use client'

import { useDisclosure, Text, Dialog, Portal } from '@chakra-ui/react';
import { useEffect } from 'react'
import { useUserAccount } from './UserAccountProvider'

export function BlockedAddressModal() {
  const { open, onOpen, onClose } = useDisclosure()
  const { isBlocked } = useUserAccount()

  useEffect(() => {
    if (isBlocked) onOpen()
  }, [isBlocked])

  return (
    <Dialog.Root
      placement='center'
      open={open}
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) {
          onClose();
        }
      }}>
      <Portal>

        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>Address blocked</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Text color="grayText" mb="md">
                Your address is blocked from transacting on this site.
              </Text>
              <Text color="grayText" mb="md">
                Your wallet address cannot use this site because it has been flagged as high risk by our
                compliance partner, Hypernative.
              </Text>
              <Text color="grayText" mb="md">
                This website is open source and permissionless. Anyone can fork and run their own front
                end.
              </Text>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>

      </Portal>
    </Dialog.Root>
  );
}
