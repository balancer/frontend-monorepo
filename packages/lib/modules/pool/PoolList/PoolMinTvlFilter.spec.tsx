import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { PoolMinTvlFilter } from './PoolMinTvlFilter'

const mockSetMinTvl = vi.fn()
const mockToCurrency = vi.fn((value: number) => `$${value.toLocaleString()}`)

vi.mock('./PoolListProvider', async importOriginal => {
  const actual = await importOriginal<typeof import('./PoolListProvider')>()
  return {
    ...actual,
    usePoolList: vi.fn(),
  }
})

vi.mock('@repo/lib/shared/hooks/useCurrency', () => ({
  useCurrency: () => ({ toCurrency: mockToCurrency }),
}))

import { usePoolList } from './PoolListProvider'

const mockedUsePoolList = vi.mocked(usePoolList)

describe('PoolMinTvlFilter', () => {
  it('resets the slider to the new minTvl value when minTvl changes', () => {
    mockedUsePoolList.mockReturnValue({
      queryState: {
        minTvl: 0,
        setMinTvl: mockSetMinTvl,
      },
    } as unknown as ReturnType<typeof usePoolList>)

    const { rerender, container } = render(<PoolMinTvlFilter />)

    const slider = container.querySelector('[role="slider"]')
    expect(slider).toHaveAttribute('aria-valuenow', '0')

    mockedUsePoolList.mockReturnValue({
      queryState: {
        minTvl: 1_000_000,
        setMinTvl: mockSetMinTvl,
      },
    } as unknown as ReturnType<typeof usePoolList>)

    rerender(<PoolMinTvlFilter />)

    const resetSlider = container.querySelector('[role="slider"]')
    expect(resetSlider).toHaveAttribute('aria-valuenow', '500')
  })
})
