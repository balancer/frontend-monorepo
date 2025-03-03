import {
  Box,
  Button,
  Grid,
  GridItem,
  PopoverBody,
  PopoverContent,
  Text,
  VStack,
  Popover,
  PopoverTrigger,
} from '@chakra-ui/react'
import { endOfWeek, format, startOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns'
import { SystemStyleObject } from '@chakra-ui/styled-system'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { ReminderButton } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/ReminderButton'

function getWeekDays() {
  const weekDays = eachDayOfInterval({ start: startOfWeek(new Date()), end: endOfWeek(new Date()) })
  return weekDays
}

function getVisibleDays(startDate: Date, endDate: Date) {
  const firstDay = startOfWeek(startDate)
  const lastDay = endOfWeek(endDate)
  const days = eachDayOfInterval({ start: firstDay, end: lastDay })

  return days.map(day => ({
    day,
    visible: isWithinInterval(day, { start: firstDay, end: lastDay }),
  }))
}

export interface StaticCalendarProps {
  startDate?: Date
  endDate?: Date
  isDayDisabled?: (date: Date) => boolean
  isDaySelected?: (day: Date) => boolean
  isDayActive?: (day: Date) => boolean
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

const sharedStyles = {
  rounded: 'full',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  w: { base: '36px', lg: '40px' },
  h: { base: '36px', lg: '40px' },
  fontSize: { base: '12px', lg: '14px' },
  lineHeight: { base: undefined, lg: '20px' },
  letterSpacing: '0',
  fontWeight: 500,
  bg: 'background.level2',
  color: 'font.secondary',
}

export function StaticCalendar({
  startDate = startOfWeek(new Date()),
  endDate = endOfWeek(new Date()),
  isDayActive,
  isDayDisabled,
  isDaySelected,
}: StaticCalendarProps) {
  const { isMobile } = useBreakpoints()

  const weekDays = getWeekDays()

  const visibleDays = getVisibleDays(startDate, endDate)

  function getDayStyles(day: Date): SystemStyleObject {
    const isDisabled = isDayDisabled?.(day)
    const isActive = isDayActive?.(day)
    const isSelected = isDaySelected?.(day)

    if (isDisabled) {
      return {
        opacity: 0.2,
      }
    }

    if (isActive) {
      return {
        backgroundColor: 'green.400',
        color: 'gray.700',
      }
    }

    if (isSelected) {
      return {
        borderColor: 'green.400',
        color: 'green.400',
        borderWidth: '1px',
      }
    }

    return {}
  }

  return (
    <Grid
      gridColumnGap={{ base: '6px', lg: '8px' }}
      gridRowGap="13px"
      templateColumns="repeat(7, 1fr)"
    >
      {weekDays.map(weekDay => (
        <GridItem
          key={`weekday-${weekDay.getDay()}`}
          px={{ base: '6px', lg: '8px' }}
          py="2px"
          textAlign="center"
        >
          <Text
            fontSize={{ base: '12px', lg: '14px' }}
            lineHeight={{ base: undefined, lg: '20px' }}
            variant="secondary"
          >
            {format(weekDay, 'EE')}
          </Text>
        </GridItem>
      ))}

      {visibleDays.map(({ day, visible }) => (
        <GridItem key={`day-${day.getTime()}`} textAlign="center" w="fit-content">
          {visible && (
            <>
              {!isDayActive?.(day) && !isDaySelected?.(day) ? (
                <Box {...sharedStyles} sx={getDayStyles(day)}>
                  {format(day, 'dd')}
                </Box>
              ) : (
                <Popover placement="top" trigger={isMobile ? 'click' : 'hover'}>
                  <PopoverTrigger>
                    <Button
                      {...sharedStyles}
                      _hover={{}}
                      minW={{ base: '32px', lg: '40px' }}
                      sx={getDayStyles(day)}
                    >
                      {format(day, 'dd')}
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
                          {isDayActive?.(day) ? 'Next' : 'Following'} voting deadline
                        </Text>
                        <Text
                          alignSelf="start"
                          color="font.secondary"
                          fontSize="14px"
                          lineHeight="20px"
                        >
                          7pm EST, 5 October 2024
                        </Text>
                        <ReminderButton alignSelf="start">Set weekly reminder</ReminderButton>
                      </VStack>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              )}
            </>
          )}
        </GridItem>
      ))}
    </Grid>
  )
}
