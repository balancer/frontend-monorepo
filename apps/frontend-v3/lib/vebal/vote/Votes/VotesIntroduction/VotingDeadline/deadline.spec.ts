import { nextVotingDeadline } from './deadline'

afterEach(() => {
  vi.unstubAllEnvs()
})

const TODAY = new Date('2025-04-04T10:00:00.000Z') // Today is Friday 4 April 2025 at 10 AM
const NEXT_THURSDAY = new Date('2025-04-10T00:00:00.000Z')

describe('Deadline calculation', () => {
  it('should work on Madrid', () => {
    vi.stubEnv('TZ', 'Europe/Madrid')
    vi.setSystemTime(TODAY)

    const result = nextVotingDeadline()

    expect(result).toEqual(NEXT_THURSDAY)
  })

  it('should work on Florianopolis', () => {
    vi.stubEnv('TZ', 'America/Sao_Paulo')
    vi.setSystemTime(new Date('2025-04-04T10:00:00.000Z'))

    const result = nextVotingDeadline()

    expect(result).toEqual(NEXT_THURSDAY)
  })
})
