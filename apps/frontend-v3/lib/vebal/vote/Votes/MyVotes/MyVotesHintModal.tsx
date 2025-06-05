'use client'

import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import {
  Modal,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Link,
  Box,
  ModalHeader,
  VStack,
  Text,
  List,
  ListItem,
  UseDisclosureProps,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { addDays, format } from 'date-fns'

export function MyVotesHintModal({ isOpen = false, onClose = () => {} }: UseDisclosureProps) {
  const formattedUnlockDate = useMemo(() => {
    const today = new Date()
    return format(addDays(today, 10), 'dd MMM yyyy')
  }, [])
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose} size="lg">
      <SuccessOverlay />
      <ModalContent>
        <ModalHeader>How veBAL voting works</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="lg">
          <VStack gap="lg">
            <Box overflow="hidden" rounded="md">
              <Picture
                altText="Voting icons"
                defaultImgType="jpg"
                directory="/images/vebal/"
                height="240"
                imgAvif
                imgJpg
                imgName="vebal-modal-banner"
                width="800"
              />
            </Box>

            <List color="font.primary" listStylePosition="outside" listStyleType="disc" pl="md">
              <ListItem mb="xs">
                <Text>
                  Your vote directs liquidity mining emissions for the future periods starting next
                  Thursday at 0:00 UTC.
                </Text>
              </ListItem>
              <ListItem mb="xs">
                <Text>
                  There are vote incentives offered by 3rd parties (also known as bribes). If you
                  vote on pools with bribes, you can claim these bribes on third party platforms
                  like Hidden Hand and Paladin.
                </Text>
              </ListItem>
              <ListItem mb="xs">
                <Text>
                  You can vote on multiple pools in a single transaction. Simply add multiple pools
                  to your vote list.
                </Text>
              </ListItem>
              <ListItem mb="xs">
                <Text>
                  Votes are timelocked for 10 days. If you vote now, no edits can be made until{' '}
                  {formattedUnlockDate}.
                </Text>
              </ListItem>
              <ListItem mb="xs">
                <Text>
                  Voting power is set at the time of a vote. If you get more veBAL later, resubmit
                  your vote to use your increased power.
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  After you get veBAL, it can be synced to supported L2 networks to boost BAL
                  liquidity incentives on eligible pools. Currently, this is only supported at{' '}
                  <Link href="https://app.balancer.fi/#/">app.balancer.fi</Link>
                </Text>
              </ListItem>
            </List>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
