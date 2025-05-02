import {
  Button,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  VStack,
  Text,
  SystemStyleObject,
} from '@chakra-ui/react'
import { ReminderButton } from './ReminderButton'
import { format } from 'date-fns'
import { ReactNode, useState } from 'react'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
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
  const { isMobile } = useBreakpoints()

  const [isCalendarReminderOpen, setIsCalendarReminderOpen] = useState(false)

  return (
    <Popover placement="top" trigger={isMobile ? 'click' : 'hover'}>
      <PopoverTrigger>
        <Button
          {...sharedStyles}
          _hover={{}}
          minW={{ base: '32px', lg: '40px' }}
          sx={getDayStyles(day)}
        >
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent maxW="258px">
        <PopoverBody p="0">
          <VStack
            bg="background.level3"
            boxShadow={popoverBoxShadow}
            p="ms"
            rounded="lg"
            spacing="sm"
          >
            <Text
              alignSelf="start"
              color="font.secondary"
              fontSize="16px"
              fontWeight={700}
              lineHeight="20px"
            >
              {title}
            </Text>
            <Text alignSelf="start" color="font.secondary" fontSize="14px" lineHeight="20px">
              {format(day.setHours(deadline.getHours()), 'Haaa zzzz, d LLLL yyyy')}
            </Text>

            <ReminderButton alignSelf="start" onClick={() => setIsCalendarReminderOpen(true)}>
              Set weekly reminder
            </ReminderButton>

            <CalendarReminderModal
              deadline={day}
              isOpen={isCalendarReminderOpen}
              makeItWeekly
              onClose={() => setIsCalendarReminderOpen(false)}
            />
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
