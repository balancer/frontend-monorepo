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
  List,
  ListItem,
  HStack,
  Button,
  useDisclosure,
  Link,
} from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import { getDiscordLink } from '@repo/lib/shared/utils/links'

export function LearnMoreModal({ buttonLabel }: { buttonLabel: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button
        _hover={{ color: 'font.linkHover' }}
        color="font.link"
        onClick={onOpen}
        variant="ghost"
      >
        {buttonLabel}
      </Button>
      <Modal isCentered isOpen={isOpen} onClose={onClose} size="lg">
        <SuccessOverlay />
        <ModalContent>
          <ModalHeader>Learn more about LBPs</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="lg">
            <VStack gap="lg">
              <List color="font.primary" listStylePosition="outside" listStyleType="disc" pl="md">
                <ListItem mb="sm">
                  <Text>
                    LBPs typically start with an uneven ratio (like 90:10) heavily weighted toward
                    the project token, with a high initial price, and gradually shift over a
                    predetermined time period.
                  </Text>
                </ListItem>
                <ListItem mb="sm">
                  <Text>
                    The pool automatically adjusts token weights over time, causing the price to
                    decrease until there is sufficient buying pressure, which helps establish
                    natural price discovery.
                  </Text>
                </ListItem>
                <ListItem mb="sm">
                  <Text>
                    Projects only need to provide their token and a small portion (typically 10-20%)
                    of a collateral asset (like ETH or USDC) to start the pool, making it capital
                    efficient.
                  </Text>
                </ListItem>
                <ListItem mb="sm">
                  <Text>
                    The dynamic weight mechanism forces large buyers to split their trades into
                    smaller amounts over time, preventing price manipulation and enabling fairer
                    distribution.
                  </Text>
                </ListItem>
              </List>
              <HStack gap="ms" w="full">
                <Button
                  as={Link}
                  display="flex"
                  gap="1"
                  href="https://docs.balancer.fi/concepts/explore-available-balancer-pools/liquidity-bootstrapping-pool.html"
                  isExternal
                  minWidth="184px"
                  size="md"
                  variant="secondary"
                >
                  View LBP docs
                  <ArrowUpRight size={14} />
                </Button>

                <Button
                  as={Link}
                  display="flex"
                  gap="1"
                  href={getDiscordLink() || ''}
                  isExternal
                  minWidth="184px"
                  size="md"
                  variant="tertiary"
                >
                  Get help on Discord
                  <ArrowUpRight size={14} />
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
