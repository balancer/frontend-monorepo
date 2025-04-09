import { buildIcalEvent } from './calendar'

describe('Calendar events build', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-04-04T10:00:00.000Z')) // Today is Friday 4 April 2025 at 10 AM
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('should create a single calendar event', () => {
    const event = {
      title: 'My title',
      start: new Date(),
      end: new Date(),
      description: 'Some description',
      url: 'http://balancer.fi',
    }

    const icalEvent = buildIcalEvent({ event, makeItWeekly: false })

    expect(icalEvent).toContain('DTSTART:20250404T100000Z')
    expect(icalEvent).toContain('DTEND:20250404T100000Z')
    expect(icalEvent).toContain('URL:http://balancer.fi')
    expect(icalEvent).toContain('SUMMARY:My title')
    expect(icalEvent).toContain('DESCRIPTION:Some description')
  })

  it('should create a weekly event', () => {
    const event = {
      title: 'My title',
      start: new Date(),
      end: new Date(),
      description: 'Some description',
      url: 'http://balancer.fi',
    }

    const icalEvent = buildIcalEvent({ event, makeItWeekly: true })

    expect(icalEvent).toContain('RRULE:FREQ=WEEKLY;UNTIL=20260403T100000Z')
  })
})
