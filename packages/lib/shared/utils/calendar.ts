import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { addWeeks } from 'date-fns'

export type ICalEvent = {
  title: string
  start: Date
  end?: Date
  description?: string
  url?: string
}

function pad(n: number): string {
  if (n < 10) return '0' + n
  return n.toString()
}

function formatDate(date: Date): string {
  return (
    pad(date.getUTCFullYear()) +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    '00Z'
  )
}

export function buildIcalEvent({
  event,
  makeItWeekly,
}: {
  event: ICalEvent
  makeItWeekly: boolean
}): string {
  const body: string[] = []

  const dtStamp = formatDate(new Date())
  const uid = `${event.start.getTime()}@${PROJECT_CONFIG.projectName}.fi`

  body.push(`UID:${uid}`)
  body.push(`DTSTAMP:${dtStamp}`)
  body.push(`DTSTART:${formatDate(event.start)}`)
  body.push(`SUMMARY:${event.title}`)

  if (makeItWeekly) {
    const nextYear = addWeeks(event.start, 52)
    body.push(`RRULE:FREQ=WEEKLY;UNTIL=${formatDate(nextYear)}`)
  }

  if (event.url) {
    body.push(`URL;VALUE=URI:${event.url}`)
    body.push(`LOCATION:${event.url}`) // also here so Google Calendar shows a separate field with a link in it
  }

  if (event.end) body.push(`DTEND:${formatDate(event.end)}`)
  if (event.description) body.push(`DESCRIPTION:${event.description}`)

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${PROJECT_CONFIG.projectName}//Calendar//EN`,
    'BEGIN:VEVENT',
    body.join('\n'),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n')
}

export function openIcalEvent({
  event,
  makeItWeekly = false,
}: {
  event: ICalEvent
  makeItWeekly?: boolean
}) {
  const data = buildIcalEvent({ event, makeItWeekly })

  window.open(encodeURI('data:text/calendar;charset=utf8,' + data))
}
