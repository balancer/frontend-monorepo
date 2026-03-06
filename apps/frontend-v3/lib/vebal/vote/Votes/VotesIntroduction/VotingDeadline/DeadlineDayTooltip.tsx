import { Button, Popover, VStack, Text, SystemStyleObject } from '@chakra-ui/react'
import { ReminderButton } from './ReminderButton'
import { format } from 'date-fns'
import { ReactNode, useState } from 'react'
import { CalendarReminderModal } from '../../MyVotes/CalendarReminderModal'

type Props = {
  children: ReactNode
  title: string
  day: Date
  deadline: Date
  sharedStyles: any
  getDayStyles: (day: Date) => SystemStyleObject
}

const popoverBoxShadow = [
  '0px 0px 0px 1px #00000005',
  '1px 1px 1px -0.5px #0000000F',
  '3px 3px 3px -1.5px #0000000F',
  '6px 6px 6px -3px #0000000F',
  '12px 12px 12px -6px #0000000F',
  '24px 24px 24px -12px #0000000F',
  '42px 42px 42px -24px #0000000F',
  '-0.5px -0.5px 0px 0px #FFFFFF26',
].join(', ')

export function DeadlineDayTooltip({
  children,
  title,
  day,
  deadline,
  sharedStyles,
  getDayStyles,
}: Props) {
  const [isCalendarReminderOpen, setIsCalendarReminderOpen] = useState(false)

  return (
    <Popover.Root
      positioning={{
        placement: 'top',
      }}
    >
      <Popover.Trigger asChild>
        <Button
          {...sharedStyles}
          _hover={{}}
          css={getDayStyles(day)}
          minW={{ base: '32px', lg: '40px' }}
        >
          {children}
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content maxW="258px">
          <Popover.Body p="0">
            <VStack
              bg="background.level3"
              boxShadow={popoverBoxShadow}
              gap="sm"
              p="ms"
              rounded="lg"
            >
              <Text alignSelf="start" fontSize="16px" fontWeight={700} lineHeight="20px">
                {title}
              </Text>
              <Text alignSelf="start" color="font.secondary" fontSize="14px" lineHeight="20px">
                {format(day.setHours(deadline.getHours()), 'haaa zzzz, d LLLL yyyy')}
              </Text>

              <ReminderButton alignSelf="start" onClick={() => setIsCalendarReminderOpen(true)}>
                Set weekly reminder
              </ReminderButton>

              <CalendarReminderModal
                deadline={day}
                onClose={() => setIsCalendarReminderOpen(false)}
                open={isCalendarReminderOpen}
              />
            </VStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}
