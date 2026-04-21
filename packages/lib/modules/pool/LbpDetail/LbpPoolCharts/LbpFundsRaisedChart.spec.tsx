import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FundsRaisedInfo, LbpFundsRaisedChart } from './LbpFundsRaisedChart'

const useLbpPoolChartsMock = vi.fn()
const useBreakpointsMock = vi.fn()
let latestOption: any = null

const chakraThemeMock = {
  colors: {
    gray: {
      400: '#a0aec0',
      800: '#1a202c',
    },
  },
  semanticTokens: {
    colors: {
      font: {
        primary: {
          default: '#f7fafc',
          _dark: '#f7fafc',
        },
      },
    },
  },
}

vi.mock('./LbpPoolChartsProvider', () => ({
  useLbpPoolCharts: () => useLbpPoolChartsMock(),
}))

vi.mock('@chakra-ui/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@chakra-ui/react')>()

  return {
    ...actual,
    useTheme: () => chakraThemeMock,
  }
})

vi.mock('@repo/lib/shared/hooks/useBreakpoints', () => ({
  useBreakpoints: () => useBreakpointsMock(),
}))

vi.mock('echarts-for-react', () => ({
  __esModule: true,
  default: ({ option }: { option: unknown }) => {
    latestOption = option
    return <div data-testid="echart" />
  },
}))

describe('LbpFundsRaisedChart', () => {
  function makeContext(overrides: Record<string, unknown> = {}) {
    return {
      snapshots: [
        { timestamp: new Date('2026-03-17T10:00:00Z'), reserveTokenBalance: 1200 },
        { timestamp: new Date('2026-03-17T11:00:00Z'), reserveTokenBalance: 6800 },
      ],
      isLoading: false,
      startDateTime: new Date('2026-03-11T09:00:00Z'),
      endDateTime: new Date('2026-03-18T09:00:00Z'),
      reserveTokenSymbol: 'USDC',
      salePeriodText: 'Sale: 1 day remaining',
      currentFundsRaised: 6800,
      currentFundsRaisedUsd: 6800,
      currentFundsRaisedPercentage: 68,
      fundsRaisedGoal: 10000,
      hasSnapshots: true,
      isSaleOngoing: true,
      ...overrides,
    }
  }

  beforeEach(() => {
    latestOption = null
    useBreakpointsMock.mockReturnValue({ isMobile: false })
    useLbpPoolChartsMock.mockReturnValue(makeContext())
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('shows raised amount and goal progress in the funds raised header', () => {
    render(
      <ChakraProvider>
        <FundsRaisedInfo />
      </ChakraProvider>
    )

    expect(screen.getByText('6,800 USDC')).toBeInTheDocument()
    expect(screen.getByText('68% of 10,000 USDC goal')).toBeInTheDocument()
  })

  it('omits goal progress copy when no goal is available', () => {
    useLbpPoolChartsMock.mockReturnValue(
      makeContext({
        fundsRaisedGoal: null,
        currentFundsRaisedPercentage: null,
      })
    )

    render(
      <ChakraProvider>
        <FundsRaisedInfo />
      </ChakraProvider>
    )

    expect(screen.queryByText(/goal/)).not.toBeInTheDocument()
    expect(screen.getByText('$6,800.00')).toBeInTheDocument()
  })

  it('preserves sensible non-active sale copy for pre-sale or ended LBPs', () => {
    useLbpPoolChartsMock.mockReturnValue(makeContext({ isSaleOngoing: false }))

    render(
      <ChakraProvider>
        <FundsRaisedInfo />
      </ChakraProvider>
    )

    expect(screen.queryByText(/goal/)).not.toBeInTheDocument()
    expect(screen.getByText('$6,800.00')).toBeInTheDocument()
  })

  it('keeps the missing-data fallback when snapshots are absent', () => {
    useLbpPoolChartsMock.mockReturnValue(makeContext({ snapshots: [] }))

    render(
      <ChakraProvider>
        <LbpFundsRaisedChart />
      </ChakraProvider>
    )

    expect(screen.getByText('Missing data')).toBeInTheDocument()
  })

  it('adds progress-aware tooltip copy when the sale is active and a goal is available', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-17T11:00:00Z'))

    render(
      <ChakraProvider>
        <LbpFundsRaisedChart />
      </ChakraProvider>
    )

    const cutTimeSeries = latestOption.series.find(
      (series: { id?: string }) => series.id === 'cut-time'
    )
    const label = cutTimeSeries.label.formatter({
      data: [new Date('2026-03-17T11:00:00Z').getTime(), 10000 * 1.05],
    })

    expect(label).toContain('68% complete')
  })
})
