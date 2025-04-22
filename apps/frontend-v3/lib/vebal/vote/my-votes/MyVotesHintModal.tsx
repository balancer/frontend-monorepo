'use client'

import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import {
  Modal,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Box,
  ModalHeader,
  VStack,
  Image,
} from '@chakra-ui/react'
import { UseDisclosureProps } from '@chakra-ui/hooks'

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function MyVotesHintModal({ isOpen = false, onClose = () => {} }: UseDisclosureProps) {
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose} size="lg">
      <SuccessOverlay />
      <ModalContent>
        <ModalHeader>How it works</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="lg">
          <VStack gap="lg">
            <Image
              alt="How it works"
              objectFit="cover"
              rounded="md"
              shadow="md"
              src="/images/votes/how-it-works-bg.png"
            />
            <Box as="ul" color="font.primary" listStylePosition="outside" pl="lg">
              <li>
                Your vote directs liquidity mining emissions for the future periods starting next
                Thursday at 0:00 UTC.
              </li>
              <li>
                There are vote incentives offered by 3rd parties (also known as bribes). If you vote
                on pools with bribes, you can claim these bribes on third party platforms like
                Hidden Hand and Paladin.
              </li>
              <li>
                You can vote on multiple pools in a single transaction. Simply add multiple pools to
                your vote list.
              </li>
              <li>
                Votes are timelocked for 10 days. If you vote now, no edits can be made until 8
                September 2024.
              </li>
              <li>
                Voting power is set at the time of a vote. If you get more veBAL later, resubmit
                your vote to use your increased power.
              </li>
              <li>
                After you get veBAL, it can be synced to supported L2 networks to boost BAL
                liquidity incentives on eligible pools.
              </li>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
