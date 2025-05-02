'use client'

import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import {
  Modal,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Box,
  Button,
  ModalHeader,
  VStack,
  Text,
  List,
  ListItem,
  UseDisclosureProps,
} from '@chakra-ui/react'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { openIcalEvent } from '@repo/lib/shared/utils/calendar'

function setCalendarEvent(deadline: Date, makeItWeekly: boolean) {
  const event = {
    title: 'veBAL voting deadline (Balancer)',
    start: deadline,
    url: 'https://balancer.fi/vebal/vote',
  }

  openIcalEvent({ event, makeItWeekly })
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function CalendarReminderModal({
  isOpen = false,
  onClose,
  deadline,
  makeItWeekly,
}: UseDisclosureProps & { deadline: Date; makeItWeekly: boolean }) {
  const closeModal = () => onClose && onClose()

  function setReminder() {
    setCalendarEvent(deadline, makeItWeekly)
    closeModal()
  }

  return (
    <Modal isCentered isOpen={isOpen} onClose={closeModal} size="lg">
      <SuccessOverlay />
      <ModalContent>
        <ModalHeader>Set a calendar reminder</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="lg">
          <VStack gap="lg">
            <Box overflow="hidden" rounded="md">
              <Picture
                altText="Set a calendar reminder"
                defaultImgType="jpg"
                directory="/images/vebal/"
                height="240"
                imgAvif
                imgJpg
                imgName="calendar-modal-banner"
                width="800"
              />
            </Box>

            <List color="font.primary" listStylePosition="outside" listStyleType="disc" pl="md">
              <ListItem mb="xs">
                <Text>
                  For people deep into veBAL voting incentives, it can be advantageous to vote as
                  late as possible in order to see exactly which pool gauges offer the best
                  incentives per veBAL vote before the deadline.
                </Text>
              </ListItem>
              <ListItem mb="xs">
                <Text>
                  You can download an “.ics” file which can be used to add a recurring weekly
                  Thursday calendar reminder to vote.
                </Text>
              </ListItem>
              <ListItem mb="xs">
                <Text>
                  An “.ics” file is a calendar file saved in a universal calendar format used by
                  several email and calendar programs, including Microsoft Outlook, Google Calendar,
                  and Apple Calendar.
                </Text>
              </ListItem>
            </List>
            <Button onClick={setReminder} variant="secondary" w="full">
              Download .ics file
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
