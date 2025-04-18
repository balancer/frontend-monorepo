import { Box, Grid, GridItem, Text } from '@chakra-ui/react'
import {
  endOfWeek,
  format,
  startOfWeek,
  eachDayOfInterval,
  isWithinInterval,
  isSameDay,
  addWeeks,
} from 'date-fns'
import { SystemStyleObject } from '@chakra-ui/styled-system'
import { useCallback } from 'react'
import { DeadlineDayTooltip } from './DeadlineDayTooltip'
import { startOfDayUtc } from '@repo/lib/shared/utils/time'

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
  startDate: Date
  endDate: Date
  deadline: Date
}

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

export function StaticCalendar({ startDate, endDate, deadline }: StaticCalendarProps) {
  const weekDays = getWeekDays()

  const isDayDisabled = useCallback((day: Date) => day < startOfDayUtc(deadline), [deadline])

  const isDayActive = useCallback((day: Date) => isSameDay(day, deadline), [deadline])

  const isDaySelected = useCallback(
    (day: Date) => isSameDay(day, addWeeks(deadline, 1)),
    [deadline]
  )

  const visibleDays = getVisibleDays(startDate, endDate)

  function getDayStyles(day: Date): SystemStyleObject {
    const isDisabled = isDayDisabled(day)
    const isActive = isDayActive(day)
    const isSelected = isDaySelected(day)

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
            {format(weekDay, 'E')}
          </Text>
        </GridItem>
      ))}

      {visibleDays.map(({ day, visible }) => (
        <GridItem key={`day-${day.getTime()}`} textAlign="center" w="fit-content">
          {visible && (
            <>
              {!isDayActive(day) && !isDaySelected(day) ? (
                <Box {...sharedStyles} sx={getDayStyles(day)}>
                  {format(day, 'd')}
                </Box>
              ) : (
                <DeadlineDayTooltip
                  day={day}
                  deadline={deadline}
                  getDayStyles={getDayStyles}
                  sharedStyles={sharedStyles}
                  title={`${isDayActive(day) ? 'Next' : 'Following'} voting deadline`}
                >
                  {format(day, 'd')}
                </DeadlineDayTooltip>
              )}
            </>
          )}
        </GridItem>
      ))}
    </Grid>
  )
}
