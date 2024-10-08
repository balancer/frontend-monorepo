'use client'

/* eslint-disable react-hooks/exhaustive-deps */
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Text,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { useUserAccount } from './UserAccountProvider'

export function BlockedAddressModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isBlocked } = useUserAccount()

  useEffect(() => {
    if (isBlocked) onOpen()
  }, [isBlocked])

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered preserveScrollBarGap>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Address blocked</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
