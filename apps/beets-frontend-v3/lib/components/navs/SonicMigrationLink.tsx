import {
  Box,
  Button,
  HStack,
  Link,
  LinkProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { ReactNode } from 'react'
import { ArrowUpRight } from 'react-feather'
import { FantomToSonicSvg } from '../imgs/FantomToSonicSvg'

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
            <FantomToSonicSvg height={24} />
            <Box>Migration</Box>
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
        <ModalHeader>Upgrade to Sonic</ModalHeader>
        <ModalCloseButton />
        <ModalBody color="grayText">
          <Text color="font.secondary">
            Sonic mainnet is live, offering enhanced performance and new opportunities. If you still
            have assets on Fantom Opera, it's time to make the switch. We've prepared a migration
            guide to help you get started.
          </Text>

          <Text color="font.secondary" mt="md">
            You can find the legacy Fantom app at{' '}
            <Link href="https://ftm.beets.fi" target="_blank">
              https://ftm.beets.fi
            </Link>
            .
          </Text>
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
              <span>Migration Guide</span>
              <ArrowUpRight size={16} />
            </HStack>
          </Button>
          <Button
            as={NextLink}
            href="https://ftm.beets.fi"
            target="_blank"
            variant="tertiary"
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
