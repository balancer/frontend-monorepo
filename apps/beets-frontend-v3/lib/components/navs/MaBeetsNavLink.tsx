import {
  Modal,
  Text,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
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

interface MaBeetsRedirectModalProps extends LinkProps {
  triggerEl?: ReactNode
}

export function MaBeetsNavLink({ triggerEl, ...props }: MaBeetsRedirectModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Link color="font.primary" onClick={onOpen} variant="nav" {...props}>
        {triggerEl || 'maBEETS'}
      </Link>

      <MaBeetsRedirectModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export function MaBeetsRedirectModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose} preserveScrollBarGap>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>maBEETS</ModalHeader>
        <ModalCloseButton />
        <ModalBody color="grayText">
          <Text color="font.secondary">
            An integrated maBEETS experience is in the works. In the meantime, you can manage your
            Sonic maBEETS relics at{' '}
            <Link href="https://ma.beets.fi" target="_blank">
              https://ma.beets.fi
            </Link>
            .
          </Text>

          <Text color="font.secondary" mt="md">
            It&apos;s recommended that you migrate Fantom maBEETS relics to Sonic. For more
            information, refer to the migration guide at{' '}
            <Link href="https://docs.beets.fi/sonic" target="_blank">
              https://docs.beets.fi/sonic
            </Link>
            .
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button
            as={NextLink}
            href="https://ma.beets.fi"
            mr="md"
            target="_blank"
            variant="primary"
            w="full"
          >
            <HStack>
              <span>Sonic maBEETS</span>
              <ArrowUpRight size={16} />
            </HStack>
          </Button>
          <Button
            as={NextLink}
            href="https://ftm.beets.fi/mabeets"
            target="_blank"
            variant="tertiary"
            w="full"
          >
            <HStack>
              <span>Fantom maBEETS</span>
              <ArrowUpRight size={16} />
            </HStack>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
