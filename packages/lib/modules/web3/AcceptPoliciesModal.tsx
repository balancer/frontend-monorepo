'use client'

import {
  useDisclosure,
  Checkbox,
  Button,
  VStack,
  Box,
  Link,
  Dialog,
  Portal,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useUserSettings } from '../user/settings/UserSettingsProvider'
import { useUserAccount } from './UserAccountProvider'
import { useDisconnect } from 'wagmi'
import NextLink from 'next/link'
import { isBalancer, PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'

export function AcceptPoliciesModal() {
  const { open, onOpen, onClose } = useDisclosure()
  const { acceptedPolicies, setAcceptedPolicies } = useUserSettings()
  const { isBlocked, isLoading, isConnected, userAddress } = useUserAccount()
  const [isChecked, setIsChecked] = useState(false)
  const disconnect = useDisconnect()

  const { projectName } = PROJECT_CONFIG

  const isAddressInAcceptedPolicies =
    acceptedPolicies.includes(userAddress.toLowerCase()) ||
    // Avoid accepting policies on Anvil fork
    shouldUseAnvilFork

  useEffect(() => {
    if (!isLoading && isConnected && !isAddressInAcceptedPolicies && !isBlocked) {
      onOpen()
    }
  }, [acceptedPolicies, isBlocked, isLoading, isConnected, userAddress])

  function handleOnClose(isProceeding = false) {
    const shouldDisconnect = !isChecked || !acceptedPolicies.includes(userAddress.toLowerCase())
    //disconnect wallet if modal is closed without accepting & clicking 'Proceed'
    if (!isProceeding && shouldDisconnect) {
      if (isConnected) disconnect.mutate()
    }
    setIsChecked(false)
    onClose()
  }
  function handleClick() {
    // just check we don't already have it
    if (!isAddressInAcceptedPolicies) {
      setAcceptedPolicies([...acceptedPolicies, userAddress.toLowerCase()])
    }

    handleOnClose(true)
  }

  return (
    <Dialog.Root
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) {
          handleOnClose()
        }
      }}
      open={open}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>{`Accept ${projectName} policies`}</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <VStack align="flex-start" gap="md">
                <Checkbox.Root
                  alignItems="start"
                  checked={isChecked}
                  onCheckedChange={(e: { checked: boolean | 'indeterminate' }) =>
                    setIsChecked(!!e.checked)
                  }
                  size="lg"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>
                    <Checkbox.Root>
                      <Checkbox.HiddenInput />
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox.Root>
                    <Checkbox.Root>
                      <Checkbox.HiddenInput />
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Label>
                        <Checkbox.Root>
                          <Checkbox.HiddenInput />
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox.Root>
                      </Checkbox.Label>
                    </Checkbox.Root>
                    <Checkbox.Root>
                      <Checkbox.HiddenInput />
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Label>
                        {isBalancer ? (
                          <Box
                            aria-label="Accept policies"
                            color="font.primary"
                            fontSize="md"
                            mt="-3px"
                          >
                            By connecting my wallet, I agree to Balancer Foundation&apos;s{' '}
                            <Link asChild>
                              <NextLink href="/terms-of-use">Terms of Use</NextLink>
                            </Link>
                            ,{' '}
                            <Link asChild>
                              <NextLink href="/risks">Risks</NextLink>
                            </Link>
                            ,{' '}
                            <Link asChild>
                              <NextLink href="/cookies-policy">Cookies Policy</NextLink>
                            </Link>
                            , use of{' '}
                            <Link asChild>
                              <NextLink href="/3rd-party-services">Third-party services</NextLink>
                            </Link>{' '}
                            and{' '}
                            <Link asChild>
                              <NextLink href="/privacy-policy">Privacy Policy</NextLink>
                            </Link>
                            .
                          </Box>
                        ) : (
                          <Box color="font.primary" fontSize="md" mt="-3px">
                            By connecting my wallet, I agree to Beets&apos;{' '}
                            <Link asChild>
                              <NextLink href="/terms-of-service">Terms of Service</NextLink>
                            </Link>
                            .
                          </Box>
                        )}
                      </Checkbox.Label>
                    </Checkbox.Root>
                  </Checkbox.Label>
                </Checkbox.Root>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                disabled={!isChecked}
                onClick={handleClick}
                size="lg"
                variant="secondary"
                w="full"
              >
                Proceed
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
