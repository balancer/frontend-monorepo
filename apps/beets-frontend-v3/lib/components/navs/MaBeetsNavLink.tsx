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
            BEETS are live on Sonic! Visit the Fantom App to migrate your BEETS and maBEETS relics
            to sonic.
          </Text>

          <Text color="font.secondary" mt="md">
            For more information, refer to the migration guide at{' '}
            <Link href="https://docs.beets.fi/sonic#mabeets-and-beets" isExternal>
              https://docs.beets.fi/sonic#mabeets-and-beets
            </Link>
            .
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button
            as={Link}
            href="https://ma.beets.fi"
            isExternal
            mr="md"
            variant="primary"
            w="full"
          >
            <HStack>
              <span>Sonic maBEETS</span>
              <ArrowUpRight size={16} />
            </HStack>
          </Button>
          <Button
            as={Link}
            href="https://ftm.beets.fi/mabeets"
            isExternal
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
