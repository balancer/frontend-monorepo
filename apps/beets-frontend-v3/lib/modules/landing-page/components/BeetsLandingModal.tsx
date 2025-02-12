'use client'

import {
  Button,
  Checkbox,
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
import { useEffect, useState } from 'react'

export function BeetsLandingModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [hideOnNextVisit, setHideOnNextVisit] = useState(false)

  useEffect(() => {
    const shouldShowModal = localStorage.getItem('hideLandingModal') !== 'true'

    if (shouldShowModal) {
      onOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClose = () => {
    if (hideOnNextVisit) {
      localStorage.setItem('hideLandingModal', 'true')
    }
    onClose()
  }

  return (
    <Modal isCentered isOpen={isOpen} onClose={handleClose} preserveScrollBarGap>
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

        <ModalFooter alignItems="flex-start" flexDirection="column">
          <Checkbox
            isChecked={hideOnNextVisit}
            mb="md"
            onChange={e => setHideOnNextVisit(e.target.checked)}
          >
            Do not show this message again
          </Checkbox>
          <HStack width="full">
            <Button mr="md" onClick={handleClose} variant="primary" w="full">
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
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
