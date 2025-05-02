import { HStack, VStack, Text, Box } from '@chakra-ui/react'
import { useCurrentDate, useDateCountdown } from '@repo/lib/shared/hooks/date.hooks'
import { differenceInMinutes, format, nextThursday } from 'date-fns'
import { oneSecondInMs } from '@repo/lib/shared/utils/time'
import { VotingDeadlineContainer } from './VotingDeadlineContainer'
import { ReminderButton } from './ReminderButton'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { CalendarReminderModal } from '../../MyVotes/CalendarReminderModal'
import { useState } from 'react'

export function VotingDeadlineCounter() {
  const now = useCurrentDate(oneSecondInMs)
  const nowWithoutTime = new Date().setUTCHours(0, 0, 0, 0)
  const deadline = nextThursday(nowWithoutTime)

  const { daysDiff, hoursDiff, minutesDiff, secondsDiff } = useDateCountdown(deadline)

  const counters = [
    { title: 'D', value: daysDiff },
    { title: 'H', value: hoursDiff },
    { title: 'M', value: minutesDiff },
    { title: 'S', value: secondsDiff },
  ]

  const closeToDeadline = differenceInMinutes(deadline, now) < 30

  const [isCalendarReminderOpen, setIsCalendarReminderOpen] = useState(false)

  return (
    <VotingDeadlineContainer>
      <VStack spacing="md">
        <HStack justify="space-between" w="full">
          <Text alignSelf="start" color="font.secondary" fontSize="14px" lineHeight="20px">
            {format(deadline, 'EEEE, Haaa zzzz')}
          </Text>
          <ReminderButton onClick={() => setIsCalendarReminderOpen(true)}>
            Set reminder
          </ReminderButton>
          <CalendarReminderModal
            deadline={deadline}
            isOpen={isCalendarReminderOpen}
            makeItWeekly={false}
            onClose={() => setIsCalendarReminderOpen(false)}
          />
        </HStack>
        <HStack spacing="sm" w="full">
          {counters.map(counter => (
            <Box flex="1" key={counter.title}>
              <VStack position="relative" px="ms" py="13px" rounded="lg" shadow="2xl" spacing="sm">
                <Box
                  h="full"
                  inset={0}
                  overflow="hidden"
                  position="absolute"
                  rounded="lg"
                  w="full"
                  zIndex={-1}
                >
                  <Picture
                    altText="Marble texture"
                    defaultImgType="jpg"
                    directory="/images/textures/"
                    height="100%"
                    imgAvif
                    imgAvifDark
                    imgJpg
                    imgJpgDark
                    imgName="marble-square"
                    width="100%"
                  />
                </Box>
                <Box
                  bg="background.level1"
                  inset={0}
                  opacity={0.4}
                  overflow="hidden"
                  position="absolute"
                  rounded="lg"
                  zIndex={-1}
                />
                <Text color="font.secondary" fontSize="16px" fontWeight={500} lineHeight="20px">
                  {counter.title}
                </Text>
                <Text
                  color={closeToDeadline ? 'font.warning' : 'font.primary'}
                  fontSize={{ base: '24px', xl: '32px' }}
                  fontWeight={500}
                  lineHeight="40px"
                  textAlign="center"
                  w={{ base: '34px', xl: '56px' }}
                >
                  {String(counter.value).padStart(2, '0')}
                </Text>
              </VStack>
            </Box>
          ))}
        </HStack>
      </VStack>
    </VotingDeadlineContainer>
  )
}
