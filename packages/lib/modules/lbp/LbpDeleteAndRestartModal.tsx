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
  HStack,
  Button,
  useDisclosure,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { getDiscordLink } from '@repo/lib/shared/utils/links'

export function LbpDeleteAndRestartModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button
        _hover={{ color: 'font.linkHover' }}
        color="font.link"
        onClick={onOpen}
        position="relative"
        right="-8px"
        top="4px"
        variant="ghost"
      >
        Delete & restart
      </Button>
      <Modal isCentered isOpen={isOpen} onClose={onClose} size="lg">
        <SuccessOverlay />
        <ModalContent>
          <ModalHeader>Delete progress and start over</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="lg">
            <VStack>
              <Text color="font.primary">
                LBPs typically start with an uneven ratio (like 90:10) heavily weighted toward the
                project token, with a high initial price, and gradually shift over a predetermined
                time period.
              </Text>
              <HStack gap="ms" w="full">
                <Button
                  as={NextLink}
                  display="flex"
                  gap="1"
                  href="https://docs.balancer.fi/concepts/explore-available-balancer-pools/liquidity-bootstrapping-pool.html"
                  minWidth="184px"
                  size="md"
                  target="_blank"
                  variant="secondary"
                >
                  Delete and start over
                </Button>
                <Button
                  as={NextLink}
                  display="flex"
                  gap="1"
                  href={getDiscordLink() || ''}
                  minWidth="184px"
                  size="md"
                  target="_blank"
                  variant="tertiary"
                >
                  Continue set up
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
