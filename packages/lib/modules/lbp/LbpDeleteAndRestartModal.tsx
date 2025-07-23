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
import { getChainName } from '@repo/lib/config/app.config'

export function LbpDeleteAndRestartModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { resetLbpCreation, saleStructureForm } = useLbpForm()

  const handleDeleteAndRestart = () => {
    resetLbpCreation()
    onClose()
  }

  return (
    <>
      <Button _hover={{ color: 'font.linkHover' }} ml="2" mt="2" onClick={onOpen} variant="ghost">
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
                {`You have begun the process of creating a new LBP on the ${getChainName(
                  saleStructureForm.getValues('selectedChain')
                )} network.`}
                <br />
                Are you sure you want to delete all progress and start again from scratch?
              </Text>
              <HStack gap="ms" mt="md" w="full">
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
