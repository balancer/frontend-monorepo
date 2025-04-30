import { HStack, VStack, Text, Box } from '@chakra-ui/react'
import { useCurrentDate, useDateCountdown } from '@repo/lib/shared/hooks/date.hooks'
import { differenceInMinutes, format, nextThursday } from 'date-fns'
import { oneSecondInMs } from '@repo/lib/shared/utils/time'
import { VotingDeadlineContainer } from './VotingDeadlineContainer'
import { ReminderButton } from './ReminderButton'
import { openIcalEvent } from '@repo/lib/shared/utils/calendar'

function setCalendarEvent(deadline: Date) {
  const event = {
    title: 'veBAL voting deadline (Balancer)',
    start: deadline,
    url: 'https://balancer.fi/vebal/vote',
  }

  openIcalEvent({ event })
}

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

  return (
    <VotingDeadlineContainer>
      <VStack spacing="md">
        <HStack justify="space-between" w="full">
          <Text alignSelf="start" color="font.secondary" fontSize="14px" lineHeight="20px">
            {format(deadline, 'EEEE, Haaa zzzz')}
          </Text>
          <ReminderButton onClick={() => setCalendarEvent(deadline)}>Set reminder</ReminderButton>
        </HStack>
        <HStack spacing="sm" w="full">
          {counters.map(counter => (
            <Box flex="1" key={counter.title}>
              <VStack
                bg="background.level2"
                px="14px"
                py="13px"
                rounded="lg"
                shadow="md"
                spacing="sm"
              >
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
