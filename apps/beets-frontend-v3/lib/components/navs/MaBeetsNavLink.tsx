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
        <ModalHeader>maBEETS redirect</ModalHeader>
        <ModalCloseButton />
        <ModalBody color="grayText">
          <Text color="font.secondary">
            A new and improved maBEETS experience is currently being crafted. In the meantime, go to
            the old app to manage your maBEETS:
          </Text>

          <UnorderedList>
            <ListItem>
              <Text color="font.secondary">Manage your relics</Text>
            </ListItem>
            <ListItem>
              <Text color="font.secondary">Deposit into the fBEETS pool</Text>
            </ListItem>
            <ListItem>
              <Text color="font.secondary">Claim your incentives</Text>
            </ListItem>
          </UnorderedList>
        </ModalBody>

        <ModalFooter>
          <Button
            as={NextLink}
            href="https://ma.beets.fi"
            target="_blank"
            variant="primary"
            w="full"
          >
            <HStack>
              <span>Manage your maBEETS</span>
              <ArrowUpRight size={16} />
            </HStack>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
