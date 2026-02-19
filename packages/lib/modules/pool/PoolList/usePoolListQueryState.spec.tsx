import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { act } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { usePoolListQueryState } from './usePoolListQueryState'

const testAddress = '0x000000000000000000000000000000000000dEaD'

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
}

describe('Pool list state query', () => {
  it('toggles joinablePools and updates total filter count', () => {
    const { result } = testHook(() => usePoolListQueryState(), {
      wrapper: TestWrapper,
    })

    expect(result.current.joinablePools).toBe(false)
    expect(result.current.totalFilterCount).toBe(0)
    expect(result.current.pagination.pageSize).toBe(20)
    expect(result.current.pagination.pageIndex).toBe(0)

    act(() => {
      result.current.toggleJoinablePools(true)
    })

    expect(result.current.joinablePools).toBe(true)
    expect(result.current.totalFilterCount).toBe(1)
    expect(result.current.pagination.pageSize).toBe(100)
    expect(result.current.pagination.pageIndex).toBe(0)

    act(() => {
      result.current.toggleJoinablePools(false)
    })

    expect(result.current.joinablePools).toBe(false)
    expect(result.current.pagination.pageSize).toBe(20)
    expect(result.current.pagination.pageIndex).toBe(0)
  })

  it('keeps My positions and Joinable pools mutually exclusive', () => {
    const { result } = testHook(() => usePoolListQueryState(), {
      wrapper: TestWrapper,
    })

    act(() => {
      result.current.toggleUserAddress(true, testAddress)
    })

    expect(result.current.userAddress).toBe(testAddress)
    expect(result.current.joinablePools).toBe(false)

    act(() => {
      result.current.toggleJoinablePools(true)
    })

    expect(result.current.joinablePools).toBe(true)
    expect(result.current.userAddress).toBeNull()

    act(() => {
      result.current.toggleUserAddress(true, testAddress)
    })

    expect(result.current.userAddress).toBe(testAddress)
    expect(result.current.joinablePools).toBe(false)
  })

  it('resetFilters clears joinablePools', () => {
    const { result } = testHook(() => usePoolListQueryState(), {
      wrapper: TestWrapper,
    })

    act(() => {
      result.current.toggleJoinablePools(true)
    })

    expect(result.current.joinablePools).toBe(true)

    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.joinablePools).toBe(false)
  })
})
