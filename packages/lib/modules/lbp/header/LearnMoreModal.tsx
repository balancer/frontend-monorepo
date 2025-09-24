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
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

type LearnMoreModalProps = {
  subject: 'LBP' | 'pool type'
  buttonLabel: string
}

export function LearnMoreModal({ subject, buttonLabel }: LearnMoreModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const isLbp = subject === 'LBP'
  const listItems = isLbp ? lbpListItems : poolTypeListItems
  const docsUrl = isLbp
    ? 'https://docs.balancer.fi/concepts/explore-available-balancer-pools/liquidity-bootstrapping-pool.html'
    : 'https://docs.balancer.fi/concepts/explore-available-balancer-pools/'

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
          <ModalHeader>Learn more about {`${subject}s`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="lg">
            <VStack gap="lg">
              <List color="font.primary" listStylePosition="outside" listStyleType="disc" pl="md">
                {listItems.map((item, index) => (
                  <ListItem key={index}>
                    <Text>{item}</Text>
                  </ListItem>
                ))}
              </List>
              <HStack gap="ms" w="full">
                <Button
                  as={Link}
                  display="flex"
                  gap="1"
                  href={docsUrl}
                  isExternal
                  minWidth="184px"
                  size="md"
                  variant="secondary"
                >
                  View {subject} docs
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

const lbpListItems = [
  'LBPs typically start with an uneven ratio (like 90:10) heavily weighted toward the project token, with a high initial price, and gradually shift over a predetermined time period.',
  'The pool automatically adjusts token weights over time, causing the price to decrease until there is sufficient buying pressure, which helps establish natural price discovery.',
  'Projects only need to provide their token and a small portion (typically 10-20%) of a collateral asset (like ETH or USDC) to start the pool, making it capital efficient.',
  'The dynamic weight mechanism forces large buyers to split their trades into smaller amounts over time, preventing price manipulation and enabling fairer distribution.',
]

const poolTypeListItems = [
  `${PROJECT_CONFIG.projectName} offers a variety of liquidity pool types, each tailored to specific use cases`,
]
