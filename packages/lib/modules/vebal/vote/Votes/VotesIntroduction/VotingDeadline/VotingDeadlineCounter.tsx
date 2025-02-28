import { HStack, VStack, Text, Box } from '@chakra-ui/react'
import { useCurrentDate } from '@repo/lib/shared/hooks/date.hooks'
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
  nextThursday,
} from 'date-fns'
import { oneSecondInMs } from '@repo/lib/shared/utils/time'
import { VotingDeadlineContainer } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/VotingDeadlineContainer'
import { ReminderButton } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/ReminderButton'

const countdownItemBoxShadowStyles = [
  '0px 0px 0px 1px #00000005',
  '1px 1px 1px -0.5px #0000000F',
  '3px 3px 3px -1.5px #0000000F',
  '6px 6px 6px -3px #0000001A',
  '-0.5px -1px 0px 0px #FFFFFF26',
].join(', ')

export function VotingDeadlineCounter() {
  const now = useCurrentDate(oneSecondInMs)
  const deadlineDate = nextThursday(now) // fixme: calculate exact time

  const counters = [
    {
      title: 'D',
      value: differenceInDays(deadlineDate, now),
    },
    {
      title: 'H',
      value: differenceInHours(deadlineDate, now) % 24,
    },
    {
      title: 'M',
      value: differenceInMinutes(deadlineDate, now) % (24 * 60),
    },
    {
      title: 'S',
      value: differenceInSeconds(deadlineDate, now) % (24 * 60 * 60),
    },
  ]

  return (
    <VotingDeadlineContainer>
      <VStack spacing="md">
        <HStack justify="space-between" w="full">
          <Text fontSize="14px" lineHeight="20px" color="font.secondary" alignSelf="start">
            {format(deadlineDate, 'EEEE, HHa')} EST
          </Text>
          <ReminderButton>Set reminder</ReminderButton>
        </HStack>
        <HStack spacing="sm" w="full">
          {counters.map(counter => (
            <Box flex="1" key={counter.title}>
              <VStack
                rounded="lg"
                py="13px"
                px="14px"
                bg="background.level3"
                boxShadow={countdownItemBoxShadowStyles}
                spacing="sm"
              >
                <Text fontSize="16px" lineHeight="20px" fontWeight={500} color="font.secondary">
                  {counter.title}
                </Text>
                <Text
                  fontSize={{ base: '24px', lg: '32px' }}
                  lineHeight="40px"
                  fontWeight={500}
                  w={{ base: '34px', lg: '56px' }}
                  textAlign="center"
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
