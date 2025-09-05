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
import { getChainName } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

type Props = {
  modalTitle?: string
  triggerTitle?: string
  abandonAfterCreation?: React.ReactNode
  poolType: string
  network: GqlChain
  handleRestart: () => void
  isAbsolutePosition?: boolean
}

export function RestartPoolCreationModal({
  triggerTitle = 'Delete & restart',
  modalTitle = 'Delete progress and start over',
  poolType,
  network,
  handleRestart,
  abandonAfterCreation,
  isAbsolutePosition,
}: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button
        _hover={{ color: 'font.linkHover', cursor: 'pointer' }}
        onClick={onOpen}
        {...(isAbsolutePosition && {
          position: 'absolute',
          right: '-274px',
          top: '420px',
          width: '250px',
        })}
        size="xs"
        variant="ghost"
      >
        <HStack>
          <Icon as={Trash2} color="font.secondary" size={16} />
          <Text color="font.secondary">{triggerTitle}</Text>
        </HStack>
      </Button>
      <Modal isCentered isOpen={isOpen} onClose={onClose} size="lg">
        <SuccessOverlay />
        <ModalContent bg="background.level1">
          <ModalHeader fontSize="2xl">{modalTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="lg">
            <VStack>
              {abandonAfterCreation ? (
                abandonAfterCreation
              ) : (
                <Text color="font.primary">
                  {`You have begun the process of creating a new ${poolType} pool on the ${getChainName(
                    network
                  )} network. Are you sure you want to delete all progress and start again from scratch?`}
                </Text>
              )}
              <HStack gap="ms" mt="md" w="full">
                <Button
                  display="flex"
                  flex="1"
                  gap="1"
                  minWidth="184px"
                  onClick={() => {
                    handleRestart()
                    onClose()
                  }}
                  size="lg"
                  variant="danger"
                >
                  {abandonAfterCreation ? 'Abandon set up' : 'Delete and start over'}
                </Button>
                <Button
                  display="flex"
                  flex="1"
                  gap="1"
                  minWidth="184px"
                  onClick={onClose}
                  size="lg"
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
