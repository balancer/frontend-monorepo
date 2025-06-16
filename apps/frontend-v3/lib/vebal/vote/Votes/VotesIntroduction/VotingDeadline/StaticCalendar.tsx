import { Box, Grid, GridItem, Text } from '@chakra-ui/react'
import {
  endOfWeek,
  format,
  startOfWeek,
  eachDayOfInterval,
  isWithinInterval,
  isSameDay,
  addWeeks,
  isBefore,
  startOfToday,
} from 'date-fns'
import { SystemStyleObject } from '@chakra-ui/styled-system'
import { useCallback } from 'react'
import { DeadlineDayTooltip } from './DeadlineDayTooltip'
import { Picture } from '@repo/lib/shared/components/other/Picture'

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
  w: { base: '36px', xl: '40px' },
  h: { base: '36px', xl: '40px' },
  fontSize: { base: '12px', xl: '14px' },
  lineHeight: { base: undefined, xl: '20px' },
  letterSpacing: '0',
  fontWeight: 500,
  shadow: '2xl',
  color: 'font.secondary',
}

export function StaticCalendar({ startDate, endDate, deadline }: StaticCalendarProps) {
  const weekDays = getWeekDays()

  const isDayDisabled = useCallback((day: Date) => isBefore(day, startOfToday()), [])

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
    const isToday = isSameDay(day, new Date())

    if (isDisabled) {
      return {
        bg: 'background.level1',
        shadow: 'sm',
      }
    }

    const styles: SystemStyleObject = {}

    if (isActive) {
      styles.backgroundColor = 'font.highlight'
      styles.color = 'font.dark'
      styles.minWidth = '0 !important'

      if (isToday) {
        styles.borderStyle = 'dashed'
        styles.borderColor = 'black'
        styles.borderWidth = '1px'
      }
    } else if (isSelected) {
      styles.borderColor = 'font.highlight'
      styles.borderStyle = 'dashed'
      styles.color = 'font.highlight'
      styles.borderWidth = '1px'
      styles.minWidth = '0 !important'

      // Today styles override selected styles if both are true
      if (isToday) {
        styles.borderColor = 'font.link'
        styles.borderStyle = 'dotted'
        styles.color = 'font.link'
      }
    } else if (isToday) {
      styles.borderColor = 'font.link'
      styles.borderWidth = '1px'
      styles.borderStyle = 'dotted'
      styles.color = 'font.link'
    }

    return styles
  }

  return (
    <Grid
      gridColumnGap={{ base: '6px', xl: '8px' }}
      gridRowGap="13px"
      templateColumns="repeat(7, 1fr)"
    >
      {weekDays.map(weekDay => (
        <GridItem
          key={`weekday-${weekDay.getDay()}`}
          px={{ base: '6px', xl: '8px' }}
          py="2px"
          textAlign="center"
        >
          <Text
            fontSize={{ base: '12px', xl: '14px' }}
            lineHeight={{ base: undefined, xl: '20px' }}
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
                <Box position="relative">
                  <Box {...sharedStyles} sx={getDayStyles(day)}>
                    <span style={{ opacity: isDayDisabled(day) ? 0.4 : 1 }}>
                      {format(day, 'd')}
                    </span>
                  </Box>
                  <Box
                    h="full"
                    inset={0}
                    overflow="hidden"
                    position="absolute"
                    rounded="full"
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
                </Box>
              ) : (
                <DeadlineDayTooltip
                  day={day}
                  deadline={deadline}
                  getDayStyles={getDayStyles}
                  sharedStyles={sharedStyles}
                  title={`${isDayActive(day) ? 'Next' : 'The following'} voting deadline`}
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
