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
  List,
  ListItem,
  HStack,
  Button,
  useDisclosure,
  Link,
} from '@chakra-ui/react'
import { ArrowUpRight, HelpCircle } from 'react-feather'
import { getDiscordLink } from '@repo/lib/shared/utils/links'

type LearnMoreModalProps = {
  listItems: string[]
  docsUrl: string
  buttonLabel: string
  headerText: string
  showHelpIcon?: boolean
}

export function LearnMoreModal({
  buttonLabel,
  docsUrl,
  headerText,
  listItems,
  showHelpIcon = false,
}: LearnMoreModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button
        _hover={{ color: 'font.linkHover' }}
        color="font.link"
        gap="1.5"
        onClick={onOpen}
        variant="ghost"
      >
        {showHelpIcon && <HelpCircle size={16} />}
        {buttonLabel}
      </Button>
      <Modal isCentered isOpen={isOpen} onClose={onClose} size="lg">
        <SuccessOverlay />
        <ModalContent>
          <ModalHeader>{headerText}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="lg">
            <VStack gap="lg">
              <List color="font.primary" listStylePosition="outside" listStyleType="disc" pl="md">
                {listItems.map((item, index) => (
                  <ListItem key={index}>
                    <Text>{item}</Text>
                  </ListItem>
                ))}
              </List>
              <HStack gap="ms" w="full">
                <Button
                  as={Link}
                  display="flex"
                  gap="1"
                  href={docsUrl}
                  isExternal
                  minWidth="184px"
                  size="md"
                  variant="secondary"
                >
                  View docs
                  <ArrowUpRight size={14} />
                </Button>

                <Button
                  as={Link}
                  display="flex"
                  gap="1"
                  href={getDiscordLink() || ''}
                  isExternal
                  minWidth="184px"
                  size="md"
                  variant="tertiary"
                >
                  Get help on Discord
                  <ArrowUpRight size={14} />
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
