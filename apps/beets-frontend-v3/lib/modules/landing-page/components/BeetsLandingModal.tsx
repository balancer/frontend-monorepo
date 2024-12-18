'use client'

import {
  Button,
  HStack,
  Link,
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
import { ArrowUpRight } from 'react-feather'
import { useEffect } from 'react'

export function BeetsLandingModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    onOpen()
  }, [])

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose} preserveScrollBarGap>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Welcome to the new BEETS</ModalHeader>
        <ModalCloseButton />
        <ModalBody color="grayText">
          <Text color="font.secondary">
            This is your gateway to Sonic and Optimism—designed for liquid staking, real yield, and
            next-generation DeFi.
          </Text>
          <Text color="font.secondary" mt="md">
            Start your migration today and unlock the full potential of DeFi.{' '}
            <Link href="https://docs.beets.fi/sonic" target="_blank">
              Learn More About Migration
            </Link>
            .
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
          <Button onClick={onClose} variant="primary" w="full" mr="md">
            <HStack>
              <span>Let me in</span>
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
