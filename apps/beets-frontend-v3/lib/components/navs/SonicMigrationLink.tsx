import {
  Modal,
  Text,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  UnorderedList,
  ListItem,
  ModalFooter,
  Button,
  HStack,
  Link,
  useDisclosure,
  LinkProps,
} from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import NextLink from 'next/link'
import { ReactNode } from 'react'
import Image from 'next/image'

interface SonicMigrationRedirectModalProps extends LinkProps {
  triggerEl?: ReactNode
}

export function SonicMigrationLink({ triggerEl, ...props }: SonicMigrationRedirectModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Link color="font.primary" onClick={onOpen} variant="nav" {...props}>
        {triggerEl || (
          <HStack>
            <Image
              alt="fantom"
              height={24}
              src="https://assets.coingecko.com/coins/images/4001/large/Fantom.png"
              width={24}
            />
            <Text>Migration</Text>
          </HStack>
        )}
      </Link>

      <SonicMigrationModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}

function SonicMigrationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose} preserveScrollBarGap>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Migrating from Fantom Opera</ModalHeader>
        <ModalCloseButton />
        <ModalBody color="grayText">
          <Text color="font.secondary">
            Sonic is live! Do you still have assets on Fantom Opera?
          </Text>

          <UnorderedList>
            <ListItem>
              <Text color="font.secondary">bullet point 1</Text>
            </ListItem>
            <ListItem>
              <Text color="font.secondary">bullet point 2</Text>
            </ListItem>
            <ListItem>
              <Text color="font.secondary">bullet point 3</Text>
            </ListItem>
          </UnorderedList>
        </ModalBody>

        <ModalFooter>
          <Button
            as={NextLink}
            href="https://docs.beets.fi"
            target="_blank"
            variant="primary"
            w="full"
            mr="md"
          >
            <HStack>
              <span>Migration Docs</span>
              <ArrowUpRight size={16} />
            </HStack>
          </Button>
          <Button
            as={NextLink}
            href="https://ftm.beets.fi"
            target="_blank"
            variant="primary"
            w="full"
          >
            <HStack>
              <span>Fantom App</span>
              <ArrowUpRight size={16} />
            </HStack>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
