'use client'

/* eslint-disable react-hooks/exhaustive-deps */
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Checkbox,
  Button,
  VStack,
  ModalFooter,
  Box,
  Link,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useUserSettings } from '../user/settings/UserSettingsProvider'
import { useUserAccount } from './UserAccountProvider'
import { useDisconnect } from 'wagmi'
import NextLink from 'next/link'

export function AcceptPoliciesModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { acceptedPolicies, setAcceptedPolicies } = useUserSettings()
  const { isBlocked, isLoading, isConnected, userAddress } = useUserAccount()
  const [isChecked, setIsChecked] = useState(false)
  const { disconnect } = useDisconnect()

  const isAddressInAcceptedPolicies = acceptedPolicies.includes(userAddress.toLowerCase())

  useEffect(() => {
    if (!isLoading && isConnected && !isAddressInAcceptedPolicies && !isBlocked) {
      onOpen()
    } else {
      handleOnClose()
    }
  }, [acceptedPolicies, isBlocked, isLoading, isConnected, userAddress])

  //disconnect wallet if modal is closed without accepting & clicking 'Proceed'
  useEffect(() => {
    if (!isOpen && !acceptedPolicies.includes(userAddress.toLowerCase())) {
      disconnect()
    }
  }, [isOpen])

  function handleOnClose() {
    setIsChecked(false)
    onClose()
  }
  function handleClick() {
    // just check we don't already have it
    if (!isAddressInAcceptedPolicies) {
      setAcceptedPolicies([...acceptedPolicies, userAddress.toLowerCase()])
    }

    handleOnClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleOnClose} isCentered preserveScrollBarGap>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Accept Balancer UI policies</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="flex-start" gap="md">
            <Checkbox
              size="lg"
              isChecked={isChecked}
              onChange={e => setIsChecked(e.target.checked)}
              alignItems="start"
            >
              <Box fontSize="md" color="font.primary" mt="-3px">
                By connecting my wallet, I agree to Balancer Foundation&apos;s{' '}
                <Link as={NextLink} href="/terms-of-use">
                  Terms of Use
                </Link>
                ,{' '}
                <Link as={NextLink} href="/risks">
                  Risks
                </Link>
                ,{' '}
                <Link as={NextLink} href="/cookies-policy">
                  Cookies Policy
                </Link>
                , use of{' '}
                <Link as={NextLink} href="/3rd-party-services">
                  3rd party services
                </Link>{' '}
                and{' '}
                <Link as={NextLink} href="/privacy-policy">
                  Privacy Policy
                </Link>
                .
              </Box>
            </Checkbox>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="secondary"
            w="full"
            size="lg"
            isDisabled={!isChecked}
            onClick={handleClick}
          >
            Proceed
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
