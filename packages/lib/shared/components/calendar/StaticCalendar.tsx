import { Box, Grid, GridItem, Text } from '@chakra-ui/react'
import { endOfWeek, format, startOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns'
import { SystemStyleObject } from '@chakra-ui/styled-system'

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

export function StaticCalendar({
  startDate = startOfWeek(new Date()),
  endDate = endOfWeek(new Date()),
  isDayActive,
  isDayDisabled,
  isDaySelected,
}: StaticCalendarProps) {
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
    <Grid templateColumns="repeat(7, 1fr)" gridColumnGap="14px" gridRowGap="8px">
      {weekDays.map(weekDay => (
        <GridItem py="2px" px="8px" textAlign="center" key={`weekday-${weekDay.getDay()}`}>
          <Text variant="secondary">{format(weekDay, 'EE')}</Text>
        </GridItem>
      ))}

      {visibleDays.map(({ day, visible }) => (
        <GridItem textAlign="center" key={`day-${day.getTime()}`}>
          {visible && (
            <Box
              p="10px"
              rounded="full"
              bg="background.level2"
              color="font.secondary"
              sx={getDayStyles(day)}
            >
              <Text color="inherit" variant="secondary">
                {format(day, 'dd')}
              </Text>
            </Box>
          )}
        </GridItem>
      ))}
    </Grid>
  )
}
