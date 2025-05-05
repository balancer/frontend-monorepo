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
        bg: 'background.level1',
        shadow: 'sm',
      }
    }

    if (isActive) {
      return {
        backgroundColor: 'font.highlight',
        color: 'font.dark',
        minWidth: '0 !important',
      }
    }

    if (isSelected) {
      return {
        borderColor: 'font.highlight',
        color: 'font.highlight',
        borderWidth: '1px',
        minWidth: '0 !important',
      }
    }

    return {}
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
