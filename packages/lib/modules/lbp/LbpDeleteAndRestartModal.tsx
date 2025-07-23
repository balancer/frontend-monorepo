'use client'

import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import {
  Modal,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalHeader,
  VStack,
  Text,
  HStack,
  Button,
  useDisclosure,
  Icon,
} from '@chakra-ui/react'
import { Trash2 } from 'react-feather'
import { useLbpForm } from './LbpFormProvider'

export function LbpDeleteAndRestartModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { resetLbpCreation } = useLbpForm()

  const handleDeleteAndRestart = () => {
    resetLbpCreation()
    onClose()
  }

  return (
    <>
      <Button
        _hover={{ color: 'font.linkHover' }}
        onClick={onOpen}
        position="relative"
        right="-8px"
        top="4px"
        variant="ghost"
      >
        <HStack>
          <Icon as={Trash2} color="font.secondary" size={16} />
          <Text color="font.secondary">Delete & restart</Text>
        </HStack>
      </Button>
      <Modal isCentered isOpen={isOpen} onClose={onClose} size="lg">
        <SuccessOverlay />
        <ModalContent>
          <ModalHeader>Delete progress and start over</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="lg">
            <VStack>
              <Text color="font.primary">
                LBPs typically start with an uneven ratio (like 90:10) heavily weighted toward the
                project token, with a high initial price, and gradually shift over a predetermined
                time period.
              </Text>
              <HStack gap="ms" w="full">
                <Button
                  display="flex"
                  gap="1"
                  minWidth="184px"
                  onClick={handleDeleteAndRestart}
                  size="md"
                  variant="secondary"
                >
                  Delete and start over
                </Button>
                <Button
                  display="flex"
                  gap="1"
                  minWidth="184px"
                  onClick={onClose}
                  size="md"
                  variant="tertiary"
                >
                  Continue set up
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
