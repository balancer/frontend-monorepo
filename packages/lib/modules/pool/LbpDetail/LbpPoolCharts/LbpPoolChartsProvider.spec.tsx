import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sepoliaFixedLbpMock } from '../../__mocks__/api-mocks/sepoliaFixedLbpMock'
import { useLbpPoolChartsLogic } from './LbpPoolChartsProvider'

const usePoolMock = vi.fn()
const usePriceInfoMock = vi.fn()

vi.mock('../../PoolProvider', () => ({
  usePool: () => usePoolMock(),
}))

vi.mock('@repo/lib/modules/lbp/pool/usePriceInfo', async importOriginal => {
  const actual = await importOriginal<typeof import('@repo/lib/modules/lbp/pool/usePriceInfo')>()

  return {
    ...actual,
    usePriceInfo: (...args: unknown[]) => usePriceInfoMock(...args),
  }
})

describe('useLbpPoolChartsLogic', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-17T12:00:00Z'))

    usePoolMock.mockReturnValue({ pool: structuredClone(sepoliaFixedLbpMock) })
    usePriceInfoMock.mockReturnValue({
      isLoading: false,
      hourlyData: [],
      snapshots: [
        {
          timestamp: new Date('2026-03-11T10:00:00Z'),
          projectTokenPrice: 0.95,
          reserveTokenPrice: 1,
          cumulativeVolume: 0,
          cumulativeFees: 0,
          tvl: 1500,
          projectTokenBalance: 10000,
          reserveTokenBalance: 1200,
        },
        {
          timestamp: new Date('2026-03-17T11:00:00Z'),
          projectTokenPrice: 0.82,
          reserveTokenPrice: 1,
          cumulativeVolume: 0,
          cumulativeFees: 0,
          tvl: 6800,
          projectTokenBalance: 10000,
          reserveTokenBalance: 6800,
        },
      ],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('derives an in-progress sale window and progress from the Sepolia fixed LBP mock', () => {
    const { result } = renderHook(() => useLbpPoolChartsLogic())

    expect(result.current.isSaleOngoing).toBe(true)
    expect(result.current.fundsRaisedGoal).toBe(10000)
    expect(result.current.currentFundsRaisedPercentage).toBe(68)
    expect(result.current.reserveTokenSymbol).toBe('USDC')
  })

  it('returns null goal-derived labels when the pool is missing project token goal inputs', () => {
    const poolWithoutRate = structuredClone(sepoliaFixedLbpMock)
    delete (poolWithoutRate as typeof poolWithoutRate & { projectTokenRate?: string }).projectTokenRate
    usePoolMock.mockReturnValue({ pool: poolWithoutRate })

    const { result } = renderHook(() => useLbpPoolChartsLogic())

    expect(result.current.fundsRaisedGoal).toBeNull()
    expect(result.current.currentFundsRaisedPercentage).toBeNull()
  })

  it('rounds the current funds raised percentage to one decimal place for chart copy', () => {
    usePriceInfoMock.mockReturnValue({
      isLoading: false,
      hourlyData: [],
      snapshots: [
        {
          timestamp: new Date('2026-03-17T11:00:00Z'),
          projectTokenPrice: 0.82,
          reserveTokenPrice: 1,
          cumulativeVolume: 0,
          cumulativeFees: 0,
          tvl: 6789,
          projectTokenBalance: 10000,
          reserveTokenBalance: 6789,
        },
      ],
    })

    const { result } = renderHook(() => useLbpPoolChartsLogic())

    expect(result.current.formatFundsRaisedPercentage(67.89)).toBe('67.9')
    expect(result.current.currentFundsRaisedPercentage).toBe(67.89)
  })
})
